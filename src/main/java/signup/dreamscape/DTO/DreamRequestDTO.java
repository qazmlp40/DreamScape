// src/main/java/signup/dreamscape/DTO/DreamRequestDTO.java
package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "꿈 기록 생성 요청")
public class DreamRequestDTO {

    @Size(min = 1, max = 100, message = "제목은 1자 이상 100자 이하여야 합니다")
    @Schema(description = "꿈 제목", example = "바다 위를 나는 꿈")
    private String title;

    @NotBlank(message = "꿈 내용은 필수 입력값입니다")
    @Size(min = 1, max = 5000, message = "내용은 1자 이상 5000자 이하여야 합니다")
    @Schema(description = "꿈 내용")
    private String rawText;

    @Schema(description = "꿈 관련 키워드 목록", example = "[\"파다\",\"비행\",\"자유\"]")
    private List<String> tags;

    @Schema(description = "꿈 기록 시 선택한 감정", example = "행복")
    private String mood;
}
