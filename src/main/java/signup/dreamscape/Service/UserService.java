package signup.dreamscape.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 회원가입
    public UserResponseDTO signup(UserRequestDTO requestDTO) {
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            return new UserResponseDTO(null, null, requestDTO.getEmail(), "이미 존재하는 이메일입니다.");
        }

        UserEntity user = UserEntity.builder()
                .name(requestDTO.getName())
                .email(requestDTO.getEmail())
                .password(requestDTO.getPassword())
                .build();

        userRepository.save(user);

        return new UserResponseDTO(user.getUser_id(), user.getName(), user.getEmail(), "회원가입 성공!");
    }

    // 로그인
    public UserResponseDTO login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPassword().equals(password))
                .map(user -> new UserResponseDTO(user.getUser_id(), user.getName(), user.getEmail(), "로그인 성공!"))
                .orElse(new UserResponseDTO(null, null, email, "이메일 또는 비밀번호가 잘못되었습니다."));
    }
}

