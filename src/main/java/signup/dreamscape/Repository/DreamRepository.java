// src/main/java/signup/dreamscape/Repository/DreamRepository.java
package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamEntity;

import java.time.LocalDate;
import java.util.List;

// 레포지토리란 : Service → Repository → Database 순서로 디비랑 소통해줌
public interface DreamRepository extends JpaRepository<DreamEntity, Long> {
    List<DreamEntity> findByUserId(Long userId);

    // ← 새로 추가: 캘린더용 특정 날짜 조회
    List<DreamEntity> findByUserIdAndRecordedAt(Long userId, LocalDate recordedAt);

    // ← 새로 추가: 차트용 날짜 범위 조회
    List<DreamEntity> findByUserIdAndRecordedAtBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT d.mood, COUNT (d) " +
            "FROM DreamEntity d " +
            "WHERE d.userId = :userId " +
            "AND d.recordedAt BETWEEN :startDate AND :endDate " +
            "GROUP BY d.mood")
    List<Object[]> findMoodDistribution(@Param("userId") Long userId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);
}