package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamEntity;

import java.util.List;

public interface DreamRepository extends JpaRepository<DreamEntity, Long> {

    // ✅ d.user.id로 수정 (UserEntity의 실제 PK 필드명 사용)
    @Query("SELECT d FROM DreamEntity d WHERE d.user.userId = :userId ORDER BY d.createdAt DESC")
    List<DreamEntity> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT d FROM DreamEntity d WHERE d.user.userId= :userId ORDER BY d.createdAt ASC")
    List<DreamEntity> findByUserIdOrderByCreatedAtAsc(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM DreamEntity d WHERE d.user.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT d FROM DreamEntity d WHERE d.user.userId = :userId AND d.mood = :mood ORDER BY d.createdAt DESC")
    List<DreamEntity> findByUserIdAndMood(@Param("userId") Long userId, @Param("mood") String mood);

    @Query("SELECT d FROM DreamEntity d JOIN d.tags t WHERE d.user.userId = :userId AND t = :tag ORDER BY d.createdAt DESC")
    List<DreamEntity> findByUserIdAndTag(@Param("userId") Long userId, @Param("tag") String tag);
}
