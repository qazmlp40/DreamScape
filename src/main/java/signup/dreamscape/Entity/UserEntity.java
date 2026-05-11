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
    @Column(name = "user_id")  // ✅ DB 컬럼명 명시
    private Long userId;  // ✅ Java 필드명도 userId로 변경

    @Column(name = "user_nick_name")
    private String userNickName;

    @Column
    private String name;

    @Column
    private String email;

    @Column
    private String password;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "social_provider")
    private String socialProvider;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "refresh_token")
    private String refreshToken;
}
