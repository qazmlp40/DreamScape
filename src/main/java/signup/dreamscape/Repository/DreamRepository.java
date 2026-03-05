// src/main/java/signup/dreamscape/Repository/DreamRepository.java
package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import signup.dreamscape.Entity.DreamEntity;

import java.util.List;

// 레포지토리란 : Service → Repository → Database 순서로 디비랑 소통해줌
public interface DreamRepository extends JpaRepository<DreamEntity, Long> {
    List<DreamEntity> findByUserId(Long userId);
}
