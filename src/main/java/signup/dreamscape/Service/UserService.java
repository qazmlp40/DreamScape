package signup.dreamscape.Service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;
import signup.dreamscape.Security.JwtProvider;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Autowired
    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    // 1️⃣ 회원가입 (+토큰 자동 발급)
    public UserResponseDTO signup(UserRequestDTO requestDTO) {
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            return UserResponseDTO.builder()
                    .userId(null)
                    .userNickName(null)
                    .email(requestDTO.getEmail())
                    .message("이미 존재하는 이메일입니다.")
                    .accessToken(null)
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

        String token = jwtProvider.createToken(user.getEmail());

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
                .accessToken(token)
                .build();
    }

    // 2️⃣ 로그인 (JWT 토큰 발급 포함)
    public UserResponseDTO login(String email, String password) {
        System.out.println("Login attempt - email: " + email + ", password: " + password);

        return userRepository.findByEmail(email)
                .filter(user -> {
                    boolean matches = passwordEncoder.matches(password, user.getPassword());
                    System.out.println("비밀번호가 일치합니까?? " + matches);
                    return matches;
                })
                .map(user -> {
                    System.out.println("로그인에 성공하였습니다. : " + email);
                    String token = jwtProvider.createToken(email);

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
                            .accessToken(token)
                            .build();
                })
                .orElseGet(() -> {
                    System.out.println("로그인에 실패했습니다. : " + email);
                    return UserResponseDTO.builder()
                            .userId(null)
                            .userNickName(null)
                            .name(null)
                            .email(email)
                            .message("이메일 또는 비밀번호가 잘못되었습니다.")
                            .accessToken(null)
                            .build();
                });
    }

    // 3️⃣ 전체 회원 조회
    public List<UserResponseDTO> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();

        return users.stream()
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUser_id())
                        .userNickName(user.getUserNickName())
                        .name(user.getName())
                        .email(user.getEmail())
                        .profileImage(user.getProfileImage())
                        .socialProvider(user.getSocialProvider())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .message("회원 조회 성공")
                        .accessToken(null) // 조회 시에는 토큰 필요 없다고 가정
                        .build())
                .collect(Collectors.toList());
    }

    // 4️⃣ userId로 단일 회원 조회
    public UserResponseDTO getUserById(Long userId) {
        Optional<UserEntity> optionalUser = userRepository.findById(userId);

        return optionalUser
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUser_id())
                        .userNickName(user.getUserNickName())
                        .name(user.getName())
                        .email(user.getEmail())
                        .profileImage(user.getProfileImage())
                        .socialProvider(user.getSocialProvider())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .message("회원 조회 성공")
                        .accessToken(null)
                        .build())
                .orElseGet(() -> UserResponseDTO.builder()
                        .userId(null)
                        .userNickName(null)
                        .name(null)
                        .email(null)
                        .message("해당 ID의 회원을 찾을 수 없습니다.")
                        .accessToken(null)
                        .build());
    }

    // 5️⃣ 회원 탈퇴 (단일 삭제)
    @Transactional
    public UserResponseDTO deleteUserById(Long userId) {
        Optional<UserEntity> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return UserResponseDTO.builder()
                    .userId(null)
                    .userNickName(null)
                    .name(null)
                    .email(null)
                    .message("해당 ID의 회원을 찾을 수 없습니다.")
                    .accessToken(null)
                    .build();
        }

        UserEntity user = optionalUser.get();
        userRepository.delete(user);

        return UserResponseDTO.builder()
                .userId(user.getUser_id())
                .userNickName(user.getUserNickName())
                .name(user.getName())
                .email(user.getEmail())
                .message("회원 탈퇴(삭제) 완료")
                .accessToken(null)
                .build();
    }

    // 6️⃣ 전체 회원 삭제 (관리자용)
    @Transactional
    public String deleteAllUsers() {
        userRepository.deleteAll();
        return "모든 회원이 삭제되었습니다.";
    }
}