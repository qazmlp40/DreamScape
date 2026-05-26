// src/main/java/signup/dreamscape/Repository/DreamRepository.java
package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamEntity;

import java.time.LocalDateTime;
import java.util.List;

// 레포지토리란 : Service → Repository → Database 순서로 디비랑 소통해줌
public interface DreamRepository extends JpaRepository<DreamEntity, Long> {
    List<DreamEntity> findByUserId(Long userId);

    @Query("SELECT d.mood, COUNT (d) " +
            "FROM DreamEntity d " +
            "WHERE d.userId = :userId " +
            "AND d.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY d.mood")
    List<Object[]> findMoodDistribution(@Param("userId") Long userId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);
}