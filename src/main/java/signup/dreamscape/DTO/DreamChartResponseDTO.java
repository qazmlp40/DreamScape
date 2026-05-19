package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "꿈 차트 및 통계 응답 DTO")
public class DreamChartResponseDTO {

    @Schema(description = "감정별 빈도수 분", example = "{\"행복\": 5, \"슬픔\": 2, \"분노\": 1}")
    private Map<String, Long> moodDistribution;

    @Schema(description = "꿈에서 가장 많이 등장한 상위 키워드 목록 (최대 3개)")
    private List<DreamKeywordResponseDTO> topKeywords;
}