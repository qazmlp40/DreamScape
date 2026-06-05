package signup.dreamscape.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        System.out.println("========== OAuth2SuccessHandler 진입 ==========");

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String picture = (String) oAuth2User.getAttributes().get("picture");

        System.out.println("OAuth email = " + email);
        System.out.println("OAuth name = " + name);
        System.out.println("OAuth picture = " + picture);

        if (email == null || email.isBlank()) {
            throw new RuntimeException("OAuth 이메일을 가져올 수 없습니다.");
        }

        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        String finalName = name;
        String finalPicture = picture;

        UserEntity user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    System.out.println("기존 회원 없음 → 신규 Google 회원 생성");

                    UserEntity newUser = UserEntity.builder()
                            .email(email)
                            .password(UUID.randomUUID().toString())
                            .name(finalName)
                            .userNickName(finalName)
                            .profileImage(finalPicture)
                            .socialProvider("google")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(newUser);
                });

        System.out.println("DB 사용자 조회/저장 완료");
        System.out.println("userId = " + user.getUserId());
        System.out.println("userEmail = " + user.getEmail());

        String accessToken = jwtProvider.createAccessToken(
                user.getUserId(),
                user.getEmail()
        );

        System.out.println("JWT 발급 완료");
        System.out.println("accessToken = " + accessToken);

        String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        // PC 브라우저 테스트용 redirect
        String redirectUrl = "dreamscape://oauth"
                + "?accessToken=" + encodedAccessToken
                + "&userId=" + user.getUserId()
                + "&email=" + encodedEmail;

        System.out.println("redirectUrl = " + redirectUrl);
        System.out.println("========== OAuth2SuccessHandler 종료 ==========");

        response.sendRedirect(redirectUrl);
    }
}