package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamAnalysisEntity;

import java.time.LocalDateTime;
import java.util.List;

public interface DreamAnalysisRepository extends JpaRepository<DreamAnalysisEntity, Long> {
}