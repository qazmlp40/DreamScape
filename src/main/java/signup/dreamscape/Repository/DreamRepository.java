package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import signup.dreamscape.Entity.DreamEntity;

import java.util.List;

public interface DreamRepository extends JpaRepository<DreamEntity, Long> {
    List<DreamEntity> findByUserId(Long userId);
}
