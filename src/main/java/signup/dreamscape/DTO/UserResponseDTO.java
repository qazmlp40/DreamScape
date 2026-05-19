package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "사용자 정보 및 인증 토큰 응답")
public class UserResponseDTO {

    @Schema(description = "사용자 고유 ID", example = "1")
    private Long userId;

    @Schema(description = "닉네임", example = "꿈꾸는고래")
    private String userNickName;

    @Schema(description = "실명", example = "홍길동")
    private String name;

    @Schema(description = "이메일", example = "dreamer@example.com")
    private String email;

    @Schema(description = "응답 메시지", example = "로그인에 성공하였습니다.")
    private String message;

    @Schema(description = "프로필 이미지 URL", example = "https://example.com/profiles/1.png")
    private String profileImage;

    @Schema(description = "소셜 로그인 제공처", example = "KAKAO")
    private String socialProvider;

    @Schema(description = "계정 생성 일시", example = "2026-01-01T00:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "계정 정보 수정 일시", example = "2026-05-10T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "API 접근용 액세스 토큰", example = "eyJhbGciOiJIUzI1NiJ...")
    private String accessToken;

    @Schema(description = "토큰 갱신용 리프레시 토큰", example = "defGhiJklMnoPqrSt...")
    private String refreshToken; // 토큰 필드 추가
}