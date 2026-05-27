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

    // 1️⃣ 회원가입
    public UserResponseDTO signup(UserRequestDTO requestDTO) {

        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            return UserResponseDTO.builder()
                    .email(requestDTO.getEmail())
                    .message("이미 존재하는 이메일입니다.")
                    .accessToken(null)
                    .refreshToken(null)
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

        String accessToken = jwtProvider.createAccessToken(
                user.getUserId(),
                user.getEmail()
        );

        String refreshToken = jwtProvider.createRefreshToken(
                user.getUserId(),
                user.getEmail()
        );

        // DB에 RefreshToken 저장
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .userNickName(user.getUserNickName())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .socialProvider(user.getSocialProvider())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .message("회원가입 성공!")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // 2️⃣ 로그인
    public UserResponseDTO login(String email, String password) {

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(user -> {

                    String accessToken = jwtProvider.createAccessToken(
                            user.getUserId(),
                            user.getEmail()
                    );

                    String refreshToken = jwtProvider.createRefreshToken(
                            user.getUserId(),
                            user.getEmail()
                    );

                    // RefreshToken 저장
                    user.setRefreshToken(refreshToken);
                    userRepository.save(user);

                    return UserResponseDTO.builder()
                            .userId(user.getUserId())
                            .userNickName(user.getUserNickName())
                            .name(user.getName())
                            .email(user.getEmail())
                            .profileImage(user.getProfileImage())
                            .socialProvider(user.getSocialProvider())
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUpdatedAt())
                            .message("로그인 성공!")
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build();
                })
                .orElseGet(() -> UserResponseDTO.builder()
                        .email(email)
                        .message("이메일 또는 비밀번호가 잘못되었습니다.")
                        .accessToken(null)
                        .refreshToken(null)
                        .build());
    }

    // 3️⃣ 전체 회원 조회
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUserId())
                        .userNickName(user.getUserNickName())
                        .name(user.getName())
                        .email(user.getEmail())
                        .profileImage(user.getProfileImage())
                        .socialProvider(user.getSocialProvider())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .message("회원 조회 성공")
                        .build())
                .collect(Collectors.toList());
    }

    // 4️⃣ 단일 회원 조회
    public UserResponseDTO getUserById(Long userId) {

        Optional<UserEntity> optionalUser = userRepository.findById(userId);

        return optionalUser
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUserId())
                        .userNickName(user.getUserNickName())
                        .name(user.getName())
                        .email(user.getEmail())
                        .profileImage(user.getProfileImage())
                        .socialProvider(user.getSocialProvider())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .message("회원 조회 성공")
                        .build())
                .orElseGet(() -> UserResponseDTO.builder()
                        .message("해당 ID의 회원을 찾을 수 없습니다.")
                        .build());
    }

    // 5️⃣ 회원 삭제
    @Transactional
    public UserResponseDTO deleteUserById(Long userId) {

        Optional<UserEntity> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return UserResponseDTO.builder()
                    .message("해당 ID의 회원을 찾을 수 없습니다.")
                    .build();
        }

        UserEntity user = optionalUser.get();
        userRepository.delete(user);

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .message("회원 삭제 완료")
                .build();
    }

    // 6️⃣ 전체 삭제
    @Transactional
    public String deleteAllUsers() {
        userRepository.deleteAll();
        return "모든 회원 삭제 완료";
    }

    // 7️⃣ 이메일로 회원 조회 (JWT /me 용)
    public UserResponseDTO getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUserId())
                        .userNickName(user.getUserNickName())
                        .name(user.getName())
                        .email(user.getEmail())
                        .profileImage(user.getProfileImage())
                        .socialProvider(user.getSocialProvider())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .message("내 정보 조회 성공")
                        .build())
                .orElseGet(() -> UserResponseDTO.builder()
                        .email(email)
                        .message("해당 이메일의 사용자를 찾을 수 없습니다.")
                        .build());
    }

    // 8️⃣ RefreshToken으로 AccessToken 재발급
    public UserResponseDTO refreshAccessToken(String refreshToken) {

        // 1. refreshToken 유효성 검사
        if (refreshToken == null || refreshToken.isBlank()) {
            return UserResponseDTO.builder()
                    .message("RefreshToken이 비어 있습니다.")
                    .accessToken(null)
                    .refreshToken(null)
                    .build();
        }

        if (!jwtProvider.validateToken(refreshToken)) {
            return UserResponseDTO.builder()
                    .message("유효하지 않은 RefreshToken 입니다.")
                    .accessToken(null)
                    .refreshToken(null)
                    .build();
        }

        // 2. 토큰에서 이메일 추출
        String email = jwtProvider.getEmail(refreshToken);

        // 3. DB에서 사용자 조회
        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return UserResponseDTO.builder()
                    .email(email)
                    .message("사용자를 찾을 수 없습니다.")
                    .accessToken(null)
                    .refreshToken(null)
                    .build();
        }

        UserEntity user = optionalUser.get();

        // 4. DB에 저장된 refreshToken과 비교
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            return UserResponseDTO.builder()
                    .email(email)
                    .message("RefreshToken이 일치하지 않습니다.")
                    .accessToken(null)
                    .refreshToken(null)
                    .build();
        }

        // 5. 새 AccessToken 발급
        String newAccessToken = jwtProvider.createAccessToken(
                user.getUserId(),
                user.getEmail()
        );

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .userNickName(user.getUserNickName())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .socialProvider(user.getSocialProvider())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .message("AccessToken 재발급 성공")
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }
    // 9️⃣ 로그아웃
    @Transactional
    public UserResponseDTO logout(String email) {

        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return UserResponseDTO.builder()
                    .email(email)
                    .message("사용자를 찾을 수 없습니다.")
                    .build();
        }

        UserEntity user = optionalUser.get();

        // RefreshToken 무효화
        user.setRefreshToken(null);
        userRepository.save(user);

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .message("로그아웃 성공")
                .build();
    }
    // 아이디 찾기: 이름 + 닉네임으로 이메일 찾기
    public UserResponseDTO findEmail(String name, String userNickName) {
        return userRepository.findByNameAndUserNickName(name, userNickName)
                .map(user -> UserResponseDTO.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .userNickName(user.getUserNickName())
                        .message("아이디 찾기 성공")
                        .build())
                .orElseGet(() -> UserResponseDTO.builder()
                        .message("일치하는 사용자를 찾을 수 없습니다.")
                        .build());
    }

    // 비밀번호 찾기: 이메일 + 이름 확인 후 임시 비밀번호 발급
    @Transactional
    public UserResponseDTO resetPassword(String email, String name) {
        Optional<UserEntity> optionalUser = userRepository.findByEmailAndName(email, name);

        if (optionalUser.isEmpty()) {
            return UserResponseDTO.builder()
                    .email(email)
                    .message("일치하는 사용자를 찾을 수 없습니다.")
                    .build();
        }

        UserEntity user = optionalUser.get();

        String tempPassword = "temp" + System.currentTimeMillis();

        String encodedPassword = passwordEncoder.encode(tempPassword);
        user.setPassword(encodedPassword);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .message("임시 비밀번호가 발급되었습니다. 임시 비밀번호: " + tempPassword)
                .build();
    }
}