package signup.dreamscape.Service;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.shineware.nlp.komoran.constant.DEFAULT_MODEL;
import kr.co.shineware.nlp.komoran.core.Komoran;
import kr.co.shineware.nlp.komoran.model.KomoranResult;
import lombok.RequiredArgsConstructor;
import okhttp3.OkHttpClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.Entity.DreamAnalysisEntity;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Entity.DreamSymbolEntity;
import signup.dreamscape.Repository.DreamAnalysisRepository;
import signup.dreamscape.Repository.DreamRepository;
import signup.dreamscape.Repository.DreamSymbolRepository;
import signup.dreamscape.Entity.DreamSymbolMapEntity;
import signup.dreamscape.Repository.DreamSymbolMapRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api-url}")
    private String apiUrl;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.max-tokens}")
    private int maxTokens;

    @Value("${openai.temperature}")
    private double temperature;

    @Value("${openai.n}")
    private int n;

    private final OkHttpClient http;
    private final DreamRepository dreamRepository;
    private final DreamSymbolRepository dreamSymbolRepository;
    private final DreamAnalysisRepository dreamAnalysisRepository;
    private final DreamSymbolMapRepository dreamSymbolMapRepository;

    // Komoran 형태소 분석기 초기화
    private final Komoran komoran = new Komoran(DEFAULT_MODEL.FULL);

    // ========== 프롬프트 상수 ==========
    private static final String SYSTEM_PROMPT =
            "너는 꿈 일기 정리 도우미야. 반드시 아래 JSON 형식으로만 응답해. 마크다운 쓰지 마.\n" +
                    "{\n" +
                    "  \"title\": \"꿈 제목\",\n" +
                    "  \"summary\": \"꿈 요약 내용\"\n" +
                    "}";

    private static final String USER_PROMPT_TEMPLATE =
            "아래 꿈 내용을 요약해줘.\n";

    private static final String INTERPRET_SYSTEM_PROMPT =
            "너는 꿈 해석을 제공하는 시스템이야. " +
                    "반드시 아래 JSON 형식으로만 응답해. " +
                    "마크다운 코드 블록(```)을 사용하지 말고, 순수 JSON만 출력해.\n" +  // ← 추가
                    "{\n" +
                    "  \"interpretation\": \"꿈 해석 한 문장\",\n" +
                    "  \"mood\": \"긍정 또는 부정 또는 중립\"\n" +
                    "}";

    private static final String INTERPRET_USER_PROMPT_TEMPLATE =
            "다음은 사용자의 꿈 내용과, 자동으로 감지된 상징들의 기본 의미야.\n\n" +
                    "[꿈 내용]\n%s\n\n" +
                    "[상징 기본 의미]\n%s\n\n" +
                    "위 정보를 기반으로, 이 꿈의 핵심 해석을 한 문장으로만 제시해줘.\n" +
                    "형식: 'OO을 의미한다.'";


    // 꿈 요약
    public DreamResponseDTO summarizeText(Long dreamId){
        // dreamId null 체크 (로컬에서 추가)
        if (dreamId == null) {
            throw new IllegalArgumentException("dreamId는 필수입니다");
            }

        // 아이디로 꿈 조회
        DreamEntity dreamEntity = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. id=" + dreamId));
        String text = dreamEntity.getRawText(); // 로우 텍스트 받아오기

        try {
            JSONArray messages = makeSummaryMessages(text);
            JSONObject requestBody = makeRequestBody(messages);
            Request request = makeRequest(requestBody);
            String rawResponse = callOpenAIAPI(request);


            // 마크다운 제거
            rawResponse = rawResponse
                    .replaceAll("```json\\s*", "") // 찾을 패턴, 바꿀 문자열
                    .replaceAll("```\\s*", "")
                    .trim();

            // Json 파싱
            String title;
            String summary;

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(rawResponse);
            title = jsonNode.get("title").asText();
            summary = jsonNode.get("summary").asText();



            dreamEntity.setRawText(text);

            // 기존 꿈이랑 같은 행에 저장
            dreamEntity.setAiSummary(summary);
            dreamEntity.setTitle(title);


            // 디비에 저장
            DreamEntity savedDream = dreamRepository.save(dreamEntity);

            // 저장된 엔티티 정보 디티오로 옮기기(프엔에 보내주는 값)
            DreamResponseDTO responseDTO = new DreamResponseDTO();
            responseDTO.setAiSummary(savedDream.getAiSummary());
            responseDTO.setDreamId(savedDream.getDreamId());
            responseDTO.setTitle(savedDream.getTitle());

            return responseDTO;

        } catch (Exception e) {
            log.error("꿈 요약 처리 중 오류 발생", e);
            throw new RuntimeException("꿈 요약 실패: " + e.getMessage(), e);
        }
    }

    // 꿈 해몽
    public DreamResponseDTO analyzeDream(long dreamId){

        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. id=" + dreamId));

        String detectText = getTextForKeywordDetect(dream);
        if (detectText == null || detectText.isBlank()) {
            throw new IllegalArgumentException("해석할 수 있는 꿈 내용이 없습니다. id=" + dreamId);
        }

        try{
            // 3. 형태소 분석으로 키워드 감지
            List<String> allKeywords = dreamSymbolRepository.findAllKeywords();
            List<String> detectedKeywords = detectKeywords(detectText, allKeywords);

            // 4. 감지된 키워드 + 형태소로 상황에 맞는 상징의미 조회
            List<DreamSymbolEntity> symbols = new ArrayList<>();
            if (!detectedKeywords.isEmpty()) {
                List<String> morphemes = getMorphemes(detectText); // 형태소 추출
                for (String keyword : detectedKeywords) {
                    for (String morpheme : morphemes) {
                        List<DreamSymbolEntity> found =
                                dreamSymbolRepository.findByKeywordAndSituation(keyword, morpheme);
                        symbols.addAll(found);
                    }
                }
            }

            // 5. 상징의미 텍스트로 변환
            String symbolMeaningText = makeSymbolMeaningText(symbols);

            // 6. 메시지 만들고 요청바디
            JSONArray messages = makeInterpretMessages(detectText, symbolMeaningText);
            JSONObject requestBody = makeRequestBody(messages);
            Request request = makeRequest(requestBody);

            // 7. API 호출
            String rawResponse = callOpenAIAPI(request);

            // 7.5. 마크다운 코드 블록 제거
            rawResponse = rawResponse
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            // 8. JSON 파싱
            String interpretation;
            String mood;
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode node = mapper.readTree(rawResponse);
                interpretation = node.path("interpretation").asText();
                mood = node.path("mood").asText();
            } catch (Exception e) {
                // 파싱 실패하면 텍스트 전체를 interpretation으로 저장 (fallback)
                log.warn("JSON 파싱 실패, fallback 처리");
                interpretation = rawResponse;
                mood = "알 수 없음";
            }

            // 9. DB 저장
            DreamAnalysisEntity analysisEntity = new DreamAnalysisEntity();

            analysisEntity.setTextSummary(interpretation);
            analysisEntity.setInterpretation(interpretation);
            // analysisEntity.setTextSummary(interpretation); 수정
            analysisEntity.setMood(mood);
            analysisEntity.setDream(dream);
            dreamAnalysisRepository.save(analysisEntity);

            // DreamSymbolMapEntity에 저장
            // 추출된 여러 개의 상징을 반복문으로 DreamSymbolMap 테이블에 각각 저장
            for (DreamSymbolEntity symbol : symbols) {
                DreamSymbolMapEntity mapEntity = DreamSymbolMapEntity.builder()
                        .dream(dream)
                        .symbol(symbol)
                        .build();
                dreamSymbolMapRepository.save(mapEntity);
            }

            // 10. DTO 리턴
            DreamResponseDTO dreamResponse = new DreamResponseDTO();
            dreamResponse.setAiInterpretation(interpretation);
            dreamResponse.setMood(mood); //

            // 키워드 추출
            List<String> keywords = symbols.stream()
                    .map(DreamSymbolEntity::getKeyword)
                    .distinct()
                    .collect(Collectors.toList());
            dreamResponse.setDetectedKeywords(keywords);

            // 키워드를 꿈-상징 매핑 테이블에 저장
            List<DreamSymbolMapEntity> symbolMaps = symbols.stream()
                    .distinct()
                    .map(symbol -> DreamSymbolMapEntity.builder()
                            .dream(dream)
                            .symbol(symbol)
                            .build())
                    .collect(Collectors.toList());

            dreamSymbolMapRepository.saveAll(symbolMaps);

            return dreamResponse;

        } catch (Exception e) {
            log.error("꿈 해몽 처리 중 오류 발생", e);
            throw new RuntimeException("꿈 해몽 실패: " + e.getMessage(), e);
        }
    }

    // ========== 헬퍼 메서드 ==========

    // 형태소 추출
    private List<String> getMorphemes(String text) {
        KomoranResult result = komoran.analyze(text);
        return result.getTokenList().stream()
                .map(token -> token.getMorph())
                .collect(java.util.stream.Collectors.toList());
    }

    // 형태소 분석으로 키워드 감지
    private List<String> detectKeywords(String text, List<String> allKeywords) {
        if (text == null || text.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> morphemes = getMorphemes(text);
        List<String> detected = new ArrayList<>();

        for (String keyword : allKeywords) {
            if (morphemes.contains(keyword) && !detected.contains(keyword)) {
                detected.add(keyword);
            }
        }
        return detected;
    }

    // 키워드 감지에 사용할 텍스트 선택 (정리본 우선)
    private String getTextForKeywordDetect(DreamEntity dream){
        if(dream.getAiSummary() != null && !dream.getAiSummary().isBlank())
            return dream.getAiSummary();
        return dream.getRawText();
    }

    // 감지된 상징의 의미를 텍스트로 변환
    private String makeSymbolMeaningText(List<DreamSymbolEntity> symbols){
        if (symbols == null || symbols.isEmpty()) {
            return "감지된 상징이 없거나, 상징 사전에 등록된 상징이 없습니다.";
        }

        StringBuilder sb = new StringBuilder();
        for(DreamSymbolEntity s : symbols){
            sb.append("- 키워드: ").append(s.getKeyword()).append("\n")
                    .append("  기본 의미: ").append(s.getMeaning()).append("\n")
                    .append("  상세 해석: ").append(s.getMeaningContext()).append("\n\n");
        }
        return sb.toString();
    }

    // OpenAI API 요청 바디 생성
    public JSONObject makeRequestBody(JSONArray messages) {
        JSONObject body = new JSONObject();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);
        body.put("n", n);
        body.put("messages", messages);
        log.debug("요청 바디: {}", body.toString());
        return body;
    }

    // JSON 메시지 생성 (꿈 요약)
    private JSONArray makeSummaryMessages(String text) {
        JSONArray messages = new JSONArray();
        messages.put(new JSONObject().put("role", "system").put("content", SYSTEM_PROMPT));
        messages.put(new JSONObject().put("role", "user").put("content", USER_PROMPT_TEMPLATE + text));
        return messages;
    }

    // OpenAI API에 보낼 HTTP 요청 객체 생성
    public Request makeRequest(JSONObject requestBody) {
        return new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody.toString(),
                        MediaType.parse("application/json")))
                .build();
    }

    // OpenAI API 호출 및 응답 처리
    public String callOpenAIAPI(Request request) throws Exception {
        try (Response response = http.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "";
                log.error("OpenAI API 오류 [{}]", response.code());
                throw new RuntimeException("OpenAI API 오류: " + response.code());
            }

            String responseBody = response.body().string();
            log.debug("API 응답: {}", responseBody);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(responseBody);

            return rootNode.path("choices").get(0)
                    .path("message").path("content").asText();
        }
    }

    // JSON 메시지 생성 (꿈 해몽)
    private JSONArray makeInterpretMessages(String baseText, String symbolsText) {
        JSONArray messages = new JSONArray();
        messages.put(new JSONObject().put("role", "system").put("content", INTERPRET_SYSTEM_PROMPT));
        String userContent = String.format(INTERPRET_USER_PROMPT_TEMPLATE, baseText, symbolsText);
        messages.put(new JSONObject().put("role", "user").put("content", userContent));
        return messages;
    }
}