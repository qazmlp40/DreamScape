package signup.dreamscape.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.DTO.RatingRequestDTO;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Repository.DreamAnalysisRepository;
import signup.dreamscape.Entity.DreamMediaEntity;
import signup.dreamscape.Repository.DreamMediaRepository;
import signup.dreamscape.Repository.DreamRepository;

@Slf4j // 로그찍을 때 사용
@Service
@RequiredArgsConstructor
public class MediaService {

    @Value("${hailuo.api-key}")
    private String hailuoApiKey;

    @Value("${hailuo.api-url}")
    private String hailuoApiUrl;

    private final OkHttpClient httpClient;
    private final DreamRepository dreamRepository;
    private final DreamMediaRepository dreamMediaRepository;
    private final AnalysisService analysisService;

    private static final String SYSTEM_PROMPT =
            "You are a dream visualization assistant.Given a Korean dream summary, " +
                    "Return ONLY valid JSON, no markdown, no backticks, no explanation." +
                    "- \"has_human\": return true if the dream contains human characters OR bears, false if not. " +
                    "- \"aiSummaryEng\": translate to English. " +
                    "If has_human is true, replace ONLY all human characters AND bears with 'a fluffy bear character'. " +
                    "When there are multiple human characters, replace them with 'fluffy bear characters' (plural). " +
                    "DO NOT replace animals with bears under any circumstances. " +
                    "- \"mood\": You are given a dream summary and an emotional tag. \n" +
                    "  Combine both to describe the final visual atmosphere as a short English description.\n" +
                    "  Focus on colors, lighting, and weather. Keep it under 15 words. \n" +
                    "  Example: \"soft pink sky, warm golden light, gentle breeze\"\n" +
                    "  Keep it under 15 words." +
                    "- \"videoPrompt\": Write a cinematic video generation prompt in English based on aiSummaryEng. " +
                    "If the dream has multiple events or scenes, capture the full narrative journey — not just the conclusion. " +
                    "Structure the prompt in three parts: " +
                    "(1) OPENING: Describe the initial setting, atmosphere, and lighting. " +
                    "(2) JOURNEY: Describe the sequence of events and what the bear character experiences along the way. " +
                    "(3) ENDING: Describe how the scene concludes or fades. " +
                    "Write as flowing prose. Do not use bullet points or headers. Keep total length under 200 words.";


    public MediaResponseDTO generateVideo(Long dreamId) throws Exception {

        // 1. 꿈요약 DreamEntity에서 가지고 오기
        DreamEntity dreamEntity = dreamRepository.findById(dreamId) // 얘가 옵셔널 타입임.. 예외처리 필요
                .orElseThrow(() -> new IllegalArgumentException(("존재하지 않는 꿈 id=" + dreamId))); // orElseThrow = 없으면 예외 던져 (옵셔널에서만 씀)
        String aiSummary = dreamEntity.getAiSummary();
//
        // 제 1분위기 추출
//        DreamAnalysisEntity dreamAnalysisEntity = dreamAnalysisRepository.findById(dreamId)
//                .orElseThrow(() -> new IllegalArgumentException(("존재하지 않는 꿈 id=" + dreamId)));
//        String firstMood = dreamAnalysisEntity.getMood();

        // 임의 코드 (제1분위기)
        String firstMood = "proclamation";

        // 1.2 프롬프트 만들기
        // 1.2.1 지피티 api 불러서 무드 + 영어 요약본 만들어주기
        // 제이슨 메세지 만들고, 요청 바디
        JSONArray msg = makePromptMessages(aiSummary, firstMood);
        JSONObject requestBody = analysisService.makeRequestBody(msg);

        // http 요청 생성
        Request request = analysisService.makeRequest(requestBody);

        // api 호출
        String semiPromptMsg = analysisService.callOpenAIAPI(request);
        log.info("GPT 응답: {}", semiPromptMsg);

        // 1.2.2 mood와 aiSummaryEng 나눠주기
        // 다시 파싱하기
        ObjectMapper mapper = new ObjectMapper(); // JSON 문자열 <-> 자바 객체 변환
        JsonNode node = mapper.readTree(semiPromptMsg); // JSON 문자열을 탐색가능한 트리로 변환

        // 나누기
        // 제 2분위기 추출
        String secondMood = node.get("mood").asText();
        log.info("secondMood: {}", secondMood);

        boolean hasHuman = node.get("has_human").asBoolean();
        log.info("hasHuman: {}", hasHuman);

        String aiSummaryEng = node.get("aiSummaryEng").asText();
        log.info("aiSummaryEng :" + aiSummaryEng);

        String videoPrompt = node.get("videoPrompt").asText();

        // 최종 프롬프트

        // 후보 1. S2V-01
        String promptResult1= "The character shown in the reference image is the main character. " +
                videoPrompt + " The reference character is the only character, no humans. ";



        // 후보 2. I2V
        String promptResult2;

        if (hasHuman) {
            promptResult2 = "The bear in the first frame is the main character. "
                    + "mood: " + secondMood + ". "
                    +  videoPrompt + " No humans.";
        } else {
            promptResult2 = "The first frame sets the visual style only. Do not include the bear as a character in the scene. "
                    + "Primary mood: " + firstMood + ". "
                    + "Secondary atmosphere: " + secondMood + ". "
                    + videoPrompt +
                    " All characters and animals should be rendered in a soft 3D plush toy style, " +
                    "with fluffy texture, pastel colors, and a dreamy whimsical aesthetic, " ;
        }





        try{
            // 2. 하일루오에게 영상생성 요청 (Post) task_id 받기
            String taskId = requestVideoGeneration(promptResult2, firstMood);
            log.info("taskId = " + taskId);

            // 3. 풀링 방식으로 생성상태 계속 조회 (get) file_id 받기
            String fileId = pollVideoStatus(taskId);
            log.info("fileId = " + fileId);

            // 4. 비디오 url 조회 (get)
            String videoUrl = getVedioUrl(fileId);
            log.info("videoUrl = " + videoUrl);

            // 디티오 return
            return MediaResponseDTO.builder()
                    .mediaUrl(videoUrl)
                    .build();

        } catch (Exception e){
            log.error("영상 생성 실패", e);
            throw new RuntimeException("영상생성실패: " + e.getMessage());
        }

    }

// --------- 헬퍼 메서드 -------------

    // JSON 메시지 생성 (꿈요약Eng + 무드설정) -> GPT
    private JSONArray makePromptMessages(String aiSummary, String firstMood) {
        JSONArray messages = new JSONArray();

        messages.put(new JSONObject()
                .put("role", "system")
                .put("content",SYSTEM_PROMPT )); // 시스텝 메세지

        String userContent = "꿈 요약 : " + aiSummary + "꿈 무드 : " + firstMood;

        messages.put(new JSONObject()
                .put("role", "user")
                .put("content", userContent)); // 사용자 메세지

        return messages;
    }


    // 하일루오한테 영상생성 요청
    public String requestVideoGeneration(String prompt, String mood ) throws Exception {

        // 기본은 happy
        String referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/Hailuo_Image_Create%20a%20full%20body%20for%20this%203D%20purple%20bear%20character.%20Keep%20the%20exact%20same%20style%2C%20texture%2C%20and%20mater_496889494466334723.jpg";

        // 무드 별로이미지 바꿈
        switch (mood) {
            // 슬픔
            case "sad":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-36%20003.jpeg";
                break;
            // 분노
            case "anger":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-37%20004.png";
                break;
            // 불안
            case "proclamation":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-36%20001.jpeg";
                break;
            // 애매, 몽환
            case "ambiguous":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-37%20005.jpeg";
                break;
            // 감동
            case "impressed":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-38%20006.jpeg";
                break;
            // 흥분, 설렘
            case "excitement":
                referenceImage = "https://raw.githubusercontent.com/uzin-bot/github_test/main/KakaoTalk_Photo_2026-04-27-15-25-36%20002.jpeg";
                break;
        }

        // 후보 1. S2V-01
        // subject_reference 배열 생성
        JSONObject referenceObject = new JSONObject(); // {} 객체
        referenceObject.put("type", "character");
        referenceObject.put("image", new JSONArray().put(referenceImage));

        JSONArray referenceBody = new JSONArray(); // [] 배열
        referenceBody.put(referenceObject);

//        // 1. 요청 바디 생성
//        // 후보 1. 참조이미지 S2V-01
//        JSONObject body = new JSONObject();
//        body.put("prompt", prompt );
//        body.put("subject_reference", referenceBody);
//        body.put("model", "S2V-01");


        // 1. 요청 바디 생성
        // 후보 2. I2V
        JSONObject body = new JSONObject();
        body.put("prompt", prompt );
        body.put("first_frame_image", referenceImage);
        body.put("model", "MiniMax-Hailuo-2.3");
        body.put("duration" , 6);

        // 2. HTTP 요청 생성
        Request request = new Request.Builder()
                .url("https://api.minimax.io/v1/video_generation")
                .addHeader("Authorization","Bearer " + hailuoApiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(body.toString(),
                        MediaType.parse("application/json")))
                .build();

        // 3. API 호출
        // try - with - resources : 얘는 Http를 다쓰고 나면 자동으로 닫아줌
        try (Response response = httpClient.newCall(request).execute()) {

            // 응답 상태 확인
            if(!response.isSuccessful()){
                throw new RuntimeException("Hailuo API 오류: " + response.code());
            }

            // 응답 파싱
            String responseBody = response.body().string();
            log.info("하일루오 응답: " + responseBody);

            // JSON 문자열 -> 자바 객체로 변환해 주는 도구
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(responseBody);

            // 4. 에러 체크
            int statusCode = rootNode.path("base_resp").path("status_code").asInt();
            if (statusCode != 0) {
                throw new RuntimeException("하일루오 오류 코드: "+ statusCode);
            }

            // 5. task_id 반환
            String taskId = rootNode.path("task_id").asText();
            log.info("taskId: " + taskId);
            log.info("prompt " + prompt);

            return taskId;

        }

    }
    // 생성 상태 조회
    public String pollVideoStatus(String taskId) throws Exception {

        int max = 30; // 최대 30번 시도
        int interval = 10000; // 10초마다

        for (int i = 0; i < max; i++) {
            // get 요청
            Request request = new Request.Builder()
                    .url("https://api.minimax.io/v1/query/video_generation?task_id=" +taskId)
                    .addHeader("Authorization", "Bearer " + hailuoApiKey)
                    .build();

            // execute() : 동기방식 응답 올때까지 현재 스레드 블로킹
            try (Response response = httpClient.newCall(request).execute()){
                String responseBody = response.body().string();
                log.info("풀링응답: {}", responseBody );

                //JSON 문자열 -> 자바가 알아보기 쉽게
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(responseBody);

                String status= rootNode.path("status").asText();

                switch (status){
                    case "Success":
                        return rootNode.path("file_id").asText();
                    case "Fail":
                        throw new RuntimeException("영상 생성 실패");
                    default: // preparing, Queueing, Processing
                        log.info("{}번재 풀링 중.. 상태: {}", i+1, status);
                        Thread.sleep(interval); // 5초 대기
                }

            }
        }
        throw new RuntimeException("영상 생성 타임아웃");
    }

    public String getVedioUrl(String fileId) throws Exception {

        // get 요청
        Request request = new Request.Builder()
                .url("https://api.minimax.io/v1/files/retrieve?file_id=" + fileId)
                .addHeader("Authorization", "Bearer " + hailuoApiKey)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body().string();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(responseBody);

            String videoUrl =  rootNode.path("file").path("download_url").asText();
            log.info("url = {}", videoUrl);

            return videoUrl;
        }
    }

    @Transactional // 자동으로 DB에 UPDATE 쿼리 날림
    public void updateRating(RatingRequestDTO dto) {

        // 1. 프론트에서 받은 mediaId로 DreamMediaEntity 가져오기
        DreamMediaEntity media = dreamMediaRepository.findById(dto.getMediaId())
                .orElseThrow(() -> new IllegalArgumentException("영상을 찾을 수 없습니다. ID : " + dto.getMediaId()));

        // 2. 가져온 DreamMediaEntity에 별점과 코멘트를 업데이트
        media.setRating(dto.getRating());
        media.setComment(dto.getComment());
    }
}
