package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "굼 키워드 정보")
public class DreamKeywordResponseDTO {

    @Schema(description = "꿈 핵심 키워드", example = "바다")
    private String keyword;

    @Schema(description = "해당 키워드 등장 횟수", example = "3")
    private Long count;
}