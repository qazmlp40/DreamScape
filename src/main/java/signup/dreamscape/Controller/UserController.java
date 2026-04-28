package signup.dreamscape.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.UserLoginRequestDTO;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Security.JwtProvider;
import signup.dreamscape.Service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/t_user")
public class UserController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    @Autowired
    public UserController(UserService userService, JwtProvider jwtProvider) {
        this.userService = userService;
        this.jwtProvider = jwtProvider;
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

    // 전체 회원 삭제
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> deleteAllUsers() {
        return ResponseEntity.ok(userService.deleteAllUsers());
    }

    // ✅🔥 추가: 현재 로그인한 사용자 확인 (JWT 테스트 핵심)
// 현재 로그인한 사용자 확인 (JWT 테스트 핵심)
    @GetMapping("/me")
    public UserResponseDTO getMyInfo(Authentication authentication) {

        String email = authentication.getName(); // JWT subject = email

        return userService.getUserByEmail(email);
    }

    @PostMapping("/refresh")
    public ResponseEntity<UserResponseDTO> refreshToken(
            @RequestBody Map<String, String> request
    ) {
        String refreshToken = request.get("refreshToken");
        return ResponseEntity.ok(userService.refreshAccessToken(refreshToken));
    }
    @PostMapping("/logout")
    public ResponseEntity<UserResponseDTO> logout(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.logout(email));
    }
}
