package signup.dreamscape.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "User API", description = "회원 가입, 로그인, 토큰 관리 및 사용자 정보 조회 API")
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
    @Operation(summary = "회원 가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/signup")
    public UserResponseDTO signup(@RequestBody UserRequestDTO requestDTO) {
        return userService.signup(requestDTO);
    }

    // 로그인
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 토큰을 발급받습니다.")
    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody UserLoginRequestDTO requestDTO) {
        return userService.login(requestDTO.getEmail(), requestDTO.getPassword());
    }

    // 전체 회원 조회
    @Operation(summary = "전체 회원 목록 조회")
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 단일 회원 조회
    @Operation(summary = "단일 회원 조회")
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // 회원 탈퇴 (단일 삭제)
    @Operation(summary = "회원 탈퇴")
    @DeleteMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> deleteUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.deleteUserById(userId));
    }

    // 전체 회원 삭제
    @Operation(summary = "전체 회원 삭제 (관리자용)")
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> deleteAllUsers() {
        return ResponseEntity.ok(userService.deleteAllUsers());
    }

    // ✅🔥 추가: 현재 로그인한 사용자 확인 (JWT 테스트 핵심)
    // 현재 로그인한 사용자 확인 (JWT 테스트 핵심)
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자(JWT 기반)의 정보를 반환합니다.")
    @GetMapping("/me")
    public UserResponseDTO getMyInfo(Authentication authentication) {

        String email = authentication.getName(); // JWT subject = email

        return userService.getUserByEmail(email);
    }

    @Operation(summary = "토큰 갱신", description = "만료된 Access Token을 Refresh Token을 통해 재발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<UserResponseDTO> refreshToken(
            @RequestBody Map<String, String> request
    ) {
        String refreshToken = request.get("refreshToken");
        return ResponseEntity.ok(userService.refreshAccessToken(refreshToken));
    }

    @Operation(summary = "로그아웃", description = "현재 로그인된 사용자를 로그아웃 처리하고 토큰을 무효화합니다.")
    @PostMapping("/logout")
    public ResponseEntity<UserResponseDTO> logout(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.logout(email));
    }

    @RestController
    public class OAuthSuccessController {

        @GetMapping("/login/success")
        public Map<String, String> loginSuccess(@RequestParam String token) {
            return Map.of(
                    "message", "구글 로그인 성공",
                    "accessToken", token
            );
        }
    }
}