package signup.dreamscape.Service;

import com.fasterxml.jackson.databind.JsonNode;
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
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Entity.DreamSymbolEntity;
import signup.dreamscape.Repository.DreamRepository;
import signup.dreamscape.Repository.DreamSymbolRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    // api 키를 읽어옴
    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.api-url}")
    private String apiUrl;

    @Value("${openai.model}")
    private String model; // 사용한 모델명

    @Value("${openai.max-tokens}")
    private int maxTokens; // 응답 최대 길이

    @Value("${openai.temperature}")
    private double temperature; // 창의성 정도

    @Value("${openai.n}")
    private int n; // 응답 개수

    private final OkHttpClient http;
    private final DreamRepository dreamRepository;
    private final DreamSymbolRepository dreamSymbolRepository;

    // ========== 프롬프트 상수 ==========
    private static final String SYSTEM_PROMPT =
            "너는 '꿈 일기 정리 도우미'야. 한국어로 간결하게 정리해.";

    private static final String USER_PROMPT_TEMPLATE =
            "아래 꿈 내용을 요약해줘.\n";

    private static final String INTERPRET_SYSTEM_PROMPT =
            "너는 간결하고 직관적인 꿈 해석을 제공하는 시스템이야. " +
                    "불필요한 설명 없이, 꿈의 핵심 의미만 한 문장으로 요약해서 말해.";

    private static final String INTERPRET_USER_PROMPT_TEMPLATE =
            "다음은 사용자의 꿈 내용과, 자동으로 감지된 상징들의 기본 의미야.\n\n" +
                    "[꿈 내용]\n%s\n\n" +
                    "[상징 기본 의미]\n%s\n\n" +
                    "위 정보를 기반으로, 이 꿈의 핵심 해석을 한 문장으로만 제시해줘.\n" +
                    "형식: 'OO을 의미한다.'";


    // 꿈 요약
    public DreamResponseDTO summarizeText(String text){
        // 입력값 검증
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("꿈 텍스트는 비어있을 수 없습니다");
        }

        try {
            // 1. 요청 바디 생성
            JSONArray messages = makeSummaryMessages(text);
            JSONObject requestBody = makeRequestBody(messages);

            // 2. HTTP 요청 생성
            Request request = makeRequest(requestBody);

            // 3. API 호출 및 응답 처리
            String summaryText = callOpenAIAPI(request);

            // 4. Entity 생성 및 저장
            DreamEntity dreamEntity = new DreamEntity();
            dreamEntity.setRawText(text);
            dreamEntity.setAiSummary(summaryText);

            // 5. DB 저장
            DreamEntity savedDream = dreamRepository.save(dreamEntity); // 레포지토리가 디비에 저장

            // 6. 저장된 엔티티 정보 디티오로 옮기기 (프엔에 보내주는 값)
            DreamResponseDTO responseDTO = new DreamResponseDTO();
            responseDTO.setAiSummary(savedDream.getAiSummary());
            responseDTO.setDreamId(savedDream.getDreamId());

            return responseDTO;

        } catch (Exception e) {
            log.error("꿈 요약 처리 중 오류 발생", e);
            throw new RuntimeException("꿈 요약 실패: " + e.getMessage(), e);
        }
    }

    // ========== 헬퍼 메서드 ==========
    // OpenAI API 요청 바디 생성
    private JSONObject makeRequestBody(JSONArray messages) {
        JSONObject body = new JSONObject();

        // 기본 설정
        body.put("model", model);
        body.put("temperature", temperature); // 창의성 정도
        body.put("max_tokens", maxTokens);
        body.put("n", n);


        body.put("messages", messages);

        log.debug("요청 바디: {}", body.toString());
        return body;
    }

    // JSON 메시지 생성 (꿈 요약)
    private JSONArray makeSummaryMessages(String text) {
        JSONArray messages = new JSONArray();

        messages.put(new JSONObject()
                .put("role", "system")
                .put("content", SYSTEM_PROMPT)); // 시스텝 메세지

        messages.put(new JSONObject()
                .put("role", "user")
                .put("content", USER_PROMPT_TEMPLATE + text)); // 사용자 메세지

        return messages;
    }

    // OpenAI API에 보낼 HTTP 요청 객체 생성
    private Request makeRequest(JSONObject requestBody) {
        return new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody.toString(),
                        MediaType.parse("application/json")))
                .build();
    }

    // OpenAI API 호출 및 응답 처리
    private String callOpenAIAPI(Request request) throws Exception {
        try (Response response = http.newCall(request).execute()) { // http가 res주고 받은 응답

            // 1. 응답 상태 확인
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "";
                log.error("OpenAI API 오류 [{}]", response.code());
                throw new RuntimeException("OpenAI API 오류: " + response.code());
            }

            // 2. 응답 파싱
            String responseBody = response.body().string();
            log.debug("API 응답: {}", responseBody);

            //3. ObjectMapper를 사용하여 JSON 응답에서 필요한 데이터만 추출
            ObjectMapper mapper = new ObjectMapper();

            // 전체 JSON 응답을 JsonNode로 변환
            JsonNode rootNode = mapper.readTree(responseBody);

            // 실제 AI 응답 텍스트는 choices 배열의 첫 번째 요소 안에 있음.
            // 경로: choices[0].message.content
            String summaryText = rootNode
                    .path("choices") // "choices" 배열 노드를 찾음
                    .get(0)          // 첫 번째 요소 (JsonNode)를 선택
                    .path("message") // "message" 객체 노드를 찾음
                    .path("content") // "content" 필드를 찾음
                    .asText();       // 최종 텍스트로 추출



            return summaryText;
        }
    }


    // 꿈 해몽
    public DreamResponseDTO analyzeDream(long dreamId){

        // 1. 해당 꿈 가지고 오기
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. id=" + dreamId));

        // 2. 키워드 감지에 사용할 텍스트 선택
        String detectText = getTextForKeywordDetect(dream);
        if (detectText == null || detectText.isBlank()) {
            throw new IllegalArgumentException("해석할 수 있는 꿈 내용이 없습니다. id=" + dreamId);
        }

        try{
            // 3. 키워드 뭐가 들어가 있는 지 감지
            List<String> allKeywords = dreamSymbolRepository.findAllKeywords(); // 키워드 조회
            List<String> detectedKeywords = detectKeywords(detectText, allKeywords);

            // 4. 키워드에 따른 상징의미를 조회
            List<DreamSymbolEntity> symbols = detectedKeywords.isEmpty()
                    ? Collections.emptyList() // 빈 리스트 반환
                    : dreamSymbolRepository.findByKeywordIn(detectedKeywords);

            // 5. 상징의미 텍스트로 변환
            String symbolMeaningText = makeSymbolMeaningText(symbols);

            // 6. 제이쓴메세지 만들고, 요청바디
            JSONArray messages = makeInterpretMessages(detectText, symbolMeaningText);
            JSONObject requestBody = makeRequestBody(messages);

            // 5. http 요청 객체 생성
            Request request = makeRequest(requestBody);

            // 6. api 호출
            String interpretation = callOpenAIAPI(request);


            // 7. DreamResponseDTO 객체를 수동으로 생성
            DreamResponseDTO dreamResponse = new DreamResponseDTO();
            dreamResponse.setAiInterpretation(interpretation); // 꿈 해몽 저장

            return dreamResponse;

        } catch (Exception e) {
            log.error("꿈 해몽 처리 중 오류 발생", e);
            throw new RuntimeException("꿈 해몽 실패: " + e.getMessage(), e);
        }


    }

    // ========== 헬퍼 메서드 ==========
    // 키워드 감지에 사용할 텍스트 선택 (정리본 우선)
    private String getTextForKeywordDetect(DreamEntity dream){
        if(dream.getAiSummary() != null && !dream.getAiSummary().isBlank())
            return dream.getAiSummary();
        return dream.getRawText();
    }

    // text안에서 상징 키워드 감지
    private List<String> detectKeywords(String text, List<String> allKeywords){
        List<String> detected = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return detected;
        }

        for (String keyword : allKeywords) {
            if (keyword == null || keyword.isEmpty()){
                continue;
            }

            if(text.contains(keyword)){
                detected.add(keyword);
            }
        }
        return detected;
    }

    // 감지된 상징의 의미를 사람이 읽기 좋은 텍스트로 변환
    private String makeSymbolMeaningText(List<DreamSymbolEntity> symbols){
        if (symbols == null || symbols.isEmpty()) {
            return "감지된 상징이 없거나, 상징 사전에 등록된 상징이 없습니다.";
        }

        // 문자열을 이어붙이기 위한 객체
        StringBuilder sb = new StringBuilder();

        // symbols 리스트 안에 있는 DreamSymbol 엔티티를 하나씩 꺼내면서 반복
        for(DreamSymbolEntity s : symbols){
            sb.append("- 키워드: ")
                    .append(s.getKeyword())
                    .append("\n")
                    .append("  기본 의미: ")
                    .append(s.getMeaning())
                    .append("\n\n");

        }
        return sb.toString();
    }

    // JSON 메시지 생성 (꿈 해몽)
    private JSONArray makeInterpretMessages(String baseText, String symbolsText) {
        JSONArray messages = new JSONArray();

        messages.put(new JSONObject()
                .put("role", "system")
                .put("content", INTERPRET_SYSTEM_PROMPT)); // 시스텝 메세지

        String userContent = String.format(
                INTERPRET_USER_PROMPT_TEMPLATE,
                baseText,
                symbolsText
        );
        messages.put(new JSONObject()
                .put("role", "user")
                .put("content", userContent)); // 사용자 메세지

        return messages;
    }



}

