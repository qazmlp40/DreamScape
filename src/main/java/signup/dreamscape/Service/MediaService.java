package signup.dreamscape.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.DTO.RatingRequestDTO;
import signup.dreamscape.Entity.DreamEntity;
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

    public MediaResponseDTO generateVideo(Long dreamId) {

        // 1. 꿈요약 DreamEntity에서 가지고 오기
        DreamEntity dreamEntity = dreamRepository.findById(dreamId) // 얘가 옵셔널 타입임.. 예외처리 필요
                .orElseThrow(() -> new IllegalArgumentException(("존재하지 않는 꿈 id=" + dreamId))); // orElseThrow = 없으면 예외 던져 (옵셔널에서만 씀)
        String aiSummary = dreamEntity.getAiSummary();

        try{
            // 2. 하일루오에게 영상생성 요청 (Post) task_id 받기
            String taskId = requestVideoGeneration(aiSummary);
            log.info("taskId = " + taskId);

            // 3. 풀링 방식으로 생성상태 계속 조회 (get) file_id 받기
            String fileId = pollVideoStatus(taskId);
            log.info("fileId = " + fileId);

            // 4. 비디오 url 조회 (get)
            String videoUrl = getVedioUrl(fileId);
            log.info("videoUrl = " + videoUrl);

            // ------- 추가/수정 -------
            // 5. DB에 저장
            DreamMediaEntity savedMedia = dreamMediaRepository.save(
                    DreamMediaEntity.builder()
                            .dreamId(dreamId)
                            .mediaUrl(videoUrl)
                            .build()
            );

            // 임시 return (테스트용)
            return MediaResponseDTO.builder()
                    .mediaId(savedMedia.getMediaId())
                    .mediaUrl(videoUrl)
                    .build();

        } catch (Exception e){
            log.error("영상 생성 실패", e);
            throw new RuntimeException("영상생성실패: " + e.getMessage());
        }


    }

    // --------- 헬퍼 메서드 -------------

    // 하일루오한테 영상생성 요청
    public String requestVideoGeneration(String prompt) throws Exception {
        // 1. 요청 바디 생성
        JSONObject body = new JSONObject();
        body.put("model", "MiniMax-Hailuo-2.3");
        body.put("prompt", prompt);
        body.put("duration", 6);

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
            log.debug("하일루오 응답: " + responseBody);

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

            return taskId;
        }

    }
    // 생성 상태 조회
    public String pollVideoStatus(String taskId) throws Exception {

        int max = 30; // 최대 30번 시도
        int interval = 10000; // 5초마다

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
