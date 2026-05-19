package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 요청")
public class UserRequestDTO {

    @Schema(description = "사용자 닉네임", example = "꿈꾸는고래")
    private String userNickName;

    @Schema(description = "사용자 실명", example = "홍길동")
    private String name;

    @Schema(description = "이메일 주소", example = "dreamer@example.com")
    private String email;

    @Schema(description = "로그인 비밀번호", example = "password123!")
    private String password;

    @Schema(description = "프로필 이미지 URL", example = "https://example.com/profiles/1.png")
    private String profileImage;

    @Schema(description = "소셜 로그인 제공자", example = "GOOGLE")
    private String socialProvider;
}