package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import signup.dreamscape.Entity.UserEntity;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    // 이메일 중복 체크 및 로그인용
    Optional<UserEntity> findByEmail(String email);
}