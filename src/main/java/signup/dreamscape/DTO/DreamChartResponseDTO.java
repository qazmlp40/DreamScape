package signup.dreamscape.DTO;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamChartResponseDTO {

    private Map<String, Long> moodDistribution;
    private List<DreamKeywordResponseDTO> topKeywords;
}