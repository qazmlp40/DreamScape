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

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String picture = (String) oAuth2User.getAttributes().get("picture");

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

        String accessToken = jwtProvider.createAccessToken(
                user.getUserId(),
                user.getEmail()
        );

        String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        String redirectUrl = "dreamscape://oauth"
                + "?accessToken=" + encodedAccessToken
                + "&userId=" + user.getUserId()
                + "&email=" + encodedEmail;

        response.sendRedirect(redirectUrl);
    }
}