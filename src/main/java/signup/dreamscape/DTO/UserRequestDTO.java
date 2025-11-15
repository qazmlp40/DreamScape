package signup.dreamscape.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {
    private String userNickName;
    private String name;
    private String email;
    private String password;
    private String profileImage;
    private String socialProvider;

}