package signup.dreamscape.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import signup.dreamscape.DTO.UserLoginRequestDTO;
import signup.dreamscape.DTO.UserRequestDTO;
import signup.dreamscape.DTO.UserResponseDTO;
import signup.dreamscape.Service.UserService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody UserLoginRequestDTO requestDTO) {
        return userService.login(requestDTO.getEmail(), requestDTO.getPassword());
    }

    // 프로필 이미지 업로드
    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<UserResponseDTO> uploadProfileImage(@PathVariable Long userId,
                                                              @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";

        int extIndex = originalFilename.lastIndexOf(".");
        if (extIndex > 0) {
            fileExtension = originalFilename.substring(extIndex);
        }

        String storedFileName = "profile_" + userId + "_" + System.currentTimeMillis() + fileExtension;

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(storedFileName);
        file.transferTo(filePath.toFile());

        // 실제 배포 환경에 맞게 파일 접근용 URL을 구성
        String fileUrl = "/uploads/" + storedFileName;

        UserResponseDTO updatedUser = userService.updateProfileImage(userId, fileUrl);

        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedUser);
    }
}