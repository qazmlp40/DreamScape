package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "로그인 요청")
public class UserLoginRequestDTO {

    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Schema(description = "로그인 이메일", example = "dreamer@example.com")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Schema(description = "로그인 이메일", example = "dreamer@example.com")
    private String password;

    // getter, setter, 생성자 등
}