package signup.dreamscape.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamRequestDTO {

    @NotBlank(message = "제목은 필수 입력값입니다")
    @Size(min = 1, max = 100, message = "제목은 1자 이상 100자 이하여야 합니다")
    private String title;

    @NotBlank(message = "꿈 내용은 필수 입력값입니다")
    @Size(min = 1, max = 5000, message = "내용은 1자 이상 5000자 이하여야 합니다")
    private String rawText;

    private List<String> tags;

    private String mood;
}
