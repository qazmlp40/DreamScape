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
    private final String uploadDir = "./uploads/";

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

    // ✅ 전체 회원 조회
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ✅ 단일 회원 조회 (userId로 조회)
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        UserResponseDTO response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    // ✅ 회원 탈퇴 (단일 삭제)
    @DeleteMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> deleteUserById(@PathVariable Long userId) {
        UserResponseDTO response = userService.deleteUserById(userId);
        return ResponseEntity.ok(response);
    }

    // ✅ 전체 회원 삭제 (관리자용)
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllUsers() {
        String result = userService.deleteAllUsers();
        return ResponseEntity.ok(result);
    }
}