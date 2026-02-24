package signup.dreamscape.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.UserLoginRequestDTO;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Service.UserService;

import java.util.List;

@RestController
@RequestMapping("/t_user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 회원가입
    @PostMapping("/signup")
    public UserResponseDTO signup(@RequestBody UserRequestDTO requestDTO) {
        return userService.signup(requestDTO);
    }

    // 로그인
    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody UserLoginRequestDTO requestDTO) {
        return userService.login(requestDTO.getEmail(), requestDTO.getPassword());
    }

    // 전체 회원 조회
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 단일 회원 조회
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // 회원 탈퇴 (단일 삭제)
    @DeleteMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> deleteUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.deleteUserById(userId));
    }

    // 전체 회원 삭제 (ID는 계속 증가) - 운영에 더 적합
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> deleteAllUsers() {
        return ResponseEntity.ok(userService.deleteAllUsers());
    }
}
