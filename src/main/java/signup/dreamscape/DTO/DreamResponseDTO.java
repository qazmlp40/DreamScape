// src/main/java/signup/dreamscape/DTO/DreamResponseDTO.java
package signup.dreamscape.DTO;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate; // 로컬에서 추가 (26.05.09)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamResponseDTO {

    private String title; // 제목
    private Long userId;  // 유저아이디 (Long으로 통일)
    private Long dreamId; // 꿈 ID (필드명 dreamId 권장)
    private String aiSummary; // AI 요약 결과
    private String aiInterpretation; // 꿈 해몽 결과
    private String mood; // 감정 또는 분위기
    private LocalDate date; // 로컬에서 추가 (26.05.09) - 꿈 날짜
    private String rawText; // 원문(사용자가 작성한 텍스트)
    private LocalDateTime recordedAt; // 기록 시각
    private LocalDateTime createdAt; // 생성 시각
    private String tag; // 태그
    private String originalMediaUrl; // 원본 URL
    private String editedMediaUrl; // 수정 URL
}
