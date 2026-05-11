
package signup.dreamscape.Repository;

import signup.dreamscape.Entity.DreamAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // 로컬에서 추가 (AnalysisService의 findByDream_DreamId(savedDream.getDreamId()) 코드 때문에 추가함)
import signup.dreamscape.Entity.DreamEntity;

public interface DreamAnalysisRepository extends JpaRepository<DreamAnalysisEntity, Long> {
// 수정 전
//    @Query("SELECT da.mood, COUNT(da) " +
//            "FROM DreamAnalysisEntity da " +
//            "WHERE da.dream.userId = :userId " +
//            "AND da.dream.createdAt BETWEEN :startDate AND :endDate " +
//            "GROUP BY da.mood")
//    List<Object[]> findMoodDistribution(@Param("userId") Long userId,
//                                        @Param("startDate") LocalDateTime startDate,
//                                        @Param("endDate") LocalDateTime endDate);

    // 로컬에서 수정 (26.05.09)
    @Query("SELECT d.mood, COUNT(d) " +
            "FROM DreamEntity d " +
            "WHERE d.userId = :userId " +
            // 사용자가 선택한 꿈 날짜 기준으로 조회
            "AND d.date BETWEEN :startDate AND :endDate " +
            "GROUP BY d.mood")
    List<Object[]> findMoodDistribution(@Param("userId") Long userId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    Optional<DreamAnalysisEntity> findByDream_DreamId(Long dreamId); // 로컬에서 추가
}