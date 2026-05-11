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

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        if (email == null) {
            throw new RuntimeException("OAuth 이메일을 가져올 수 없습니다.");
        }

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        String accessToken = jwtProvider.createAccessToken(
                user.getUserId(),
                user.getEmail()
        );

        String encodedToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);

        String redirectUrl = "dreamappnew://oauth"
                + "?accessToken=" + encodedToken
                + "&userId=" + user.getUserId()
                + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}

