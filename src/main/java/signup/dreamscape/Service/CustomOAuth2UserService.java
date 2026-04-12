package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        UserEntity user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    // ✅ 기존 유저 업데이트
                    existingUser.setName(name);
                    existingUser.setProfileImage(picture);
                    existingUser.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // ✅ 신규 회원가입
                    UserEntity newUser = UserEntity.builder()
                            .email(email)
                            .name(name)
                            .userNickName(name) // 👉 기본 닉네임 = 이름
                            .profileImage(picture)
                            .socialProvider("google")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(newUser);
                });

        return oAuth2User;
    }
}
