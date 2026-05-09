package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import signup.dreamscape.Entity.DreamAnalysisEntity;

public interface DreamAnalysisRepository extends JpaRepository<DreamAnalysisEntity, Long> {
}