package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Google 계정에서 이메일을 가져올 수 없습니다.");
        }

        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        final String finalName = name;
        final String finalPicture = picture;

        userRepository.findByEmail(email)
                .map(existingUser -> {
                    existingUser.setName(finalName);
                    existingUser.setUserNickName(finalName);
                    existingUser.setProfileImage(finalPicture);
                    existingUser.setSocialProvider("google");
                    existingUser.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
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

        return oAuth2User;
    }
}