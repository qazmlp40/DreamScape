// src/main/java/signup/dreamscape/DTO/DreamResponseDTO.java
package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "꿈 기록 상세 정보 응답")
public class DreamResponseDTO {

    @Schema(description = "꿈 제목", example = "푸른 바다 위를 나는 꿈")
    private String title; // 제목

    @Schema(description = "작성자 ID", example = "1")
    private Long userId;  // 유저아이디 (Long으로 통일)

    @Schema(description = "꿈 기록 고유 ID", example = "10")
    private Long dreamId; // 꿈 ID (필드명 dreamId 권장)

    @Schema(description = "AI가 생성한 꿈 요약", example = "바다를 날며 자유를 만끽하는 꿈입니다.")
    private String aiSummary; // AI 요약 결과

    @Schema(description = "AI의 꿈 해몽 결과", example = "현재 진행 중인 일이 순조롭게 풀릴 징조입니다.")
    private String aiInterpretation; // 꿈 해몽 결과

    @Schema(description = "대표 감정", example = "신남")
    private String mood; // 감정 또는 분위기

    private List<String> detectedKeywords;

    @Schema(description = "사용자가 작성한 원문", example = "갑자기 등에서 날개가 돋아나더니...")
    private String rawText; // 원문(사용자가 작성한 텍스트)

    @Schema(description = "꿈 기록 시각", example = "2026-05-15T14:30:00")
    private LocalDateTime recordedAt; // 기록 시각

    @Schema(description = "데이터 생성 시각", example = "2026-05-15T14:35:00")
    private LocalDateTime createdAt; // 생성 시각

    @Schema(description = "태그 문자열", example = "비행, 바다, 자유")
    private String tag; // 태그

    @Schema(description = "생성된 원본 미디어 URL", example = "https://example.com/origin.jpg")
    private String originalMediaUrl; // 원본 URL

    @Schema(description = "편집/보정된 미디어 URL", example = "https://example.com/edited.jpg")
    private String editedMediaUrl; // 수정 URL
}
