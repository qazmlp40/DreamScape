package signup.dreamscape.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long userId;
    private String userNickName;
    private String name;
    private String email;
    private String message;
    private String profileImage;
    private String socialProvider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}