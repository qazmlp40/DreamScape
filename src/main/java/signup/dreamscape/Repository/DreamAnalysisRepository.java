package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamAnalysisEntity;

import java.time.LocalDateTime;
import java.util.List;

public interface DreamAnalysisRepository extends JpaRepository<DreamAnalysisEntity, Long> {

    @Query("SELECT da.mood, COUNT(da) " +
            "FROM DreamAnalysisEntity da " +
            "WHERE da.dream.userId = :userId " +
            "AND da.dream.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY da.mood")
    List<Object[]> findMoodDistribution(@Param("userId") Long userId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);
}