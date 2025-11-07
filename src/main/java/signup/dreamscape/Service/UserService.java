package signup.dreamscape.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 회원가입
    public UserResponseDTO signup(UserRequestDTO requestDTO) {
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            return UserResponseDTO.builder()
                    .userId(null)
                    .userNickName(null)
                    .email(requestDTO.getEmail())
                    .message("이미 존재하는 이메일입니다.")
                    .build();
        }

        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());

        UserEntity user = UserEntity.builder()
                .name(requestDTO.getName())
                .userNickName(requestDTO.getUserNickName())
                .email(requestDTO.getEmail())
                .password(encodedPassword)
                .profileImage(requestDTO.getProfileImage())
                .socialProvider(requestDTO.getSocialProvider())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return UserResponseDTO.builder()
                .userId(user.getUser_id())
                .userNickName(user.getUserNickName())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .socialProvider(user.getSocialProvider())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .message("회원가입 성공!")
                .build();
    }

    // 로그인
    public UserResponseDTO login(String email, String password) {
        System.out.println("Login attempt - email: " + email + ", password: " + password);
        return userRepository.findByEmail(email)
                .filter(user -> {
                    boolean matches = passwordEncoder.matches(password, user.getPassword());
                    System.out.println("Password matches? " + matches);
                    return matches;
                })
                .map(user -> {
                    System.out.println("Login success for user: " + email);
                    return UserResponseDTO.builder()
                            .userId(user.getUser_id())
                            .userNickName(user.getUserNickName())
                            .name(user.getName())
                            .email(user.getEmail())
                            .profileImage(user.getProfileImage())
                            .socialProvider(user.getSocialProvider())
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUpdatedAt())
                            .message("로그인 성공!")
                            .build();
                })
                .orElseGet(() -> {
                    System.out.println("Login failed for user: " + email);
                    return UserResponseDTO.builder()
                            .userId(null)
                            .userNickName(null)
                            .name(null)
                            .email(email)
                            .message("이메일 또는 비밀번호가 잘못되었습니다.")
                            .build();
                });
    }

    // 프로필 이미지 업데이트
    public UserResponseDTO updateProfileImage(Long userId, String profileImageUrl) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setProfileImage(profileImageUrl);
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);

                    return UserResponseDTO.builder()
                            .userId(user.getUser_id())
                            .userNickName(user.getUserNickName())
                            .name(user.getName())
                            .email(user.getEmail())
                            .profileImage(user.getProfileImage())
                            .socialProvider(user.getSocialProvider())
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUpdatedAt())
                            .message("프로필 이미지 업데이트 성공")
                            .build();
                })
                .orElse(null);
    }
}