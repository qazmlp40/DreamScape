package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "t_user")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    @Column
    private String userNickName;
    @Column
    private String name;

    @Column
    private String email;

    @Column
    private String password;

    @Column
    private String profileImage;

    @Column
    private String socialProvider;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}