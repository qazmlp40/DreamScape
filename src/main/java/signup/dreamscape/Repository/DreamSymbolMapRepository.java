package signup.dreamscape.Repository;

import signup.dreamscape.DTO.DreamKeywordResponseDTO;
import signup.dreamscape.Entity.DreamSymbolMapEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DreamSymbolMapRepository extends JpaRepository<DreamSymbolMapEntity, Long> {

    @Query("SELECT new signup.dreamscape.DTO.DreamKeywordResponseDTO(ds.symbol.keyword, COUNT(ds)) " +
            "FROM DreamSymbolMapEntity ds " +
            "WHERE ds.dream.userId = :userId " +
            "AND ds.dream.recordedAt BETWEEN :startDate AND :endDate " +
            "GROUP BY ds.symbol.keyword " +
            "ORDER BY COUNT(ds) DESC")
    List<DreamKeywordResponseDTO> findTopKeywords(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate,
                                                  Pageable pageable);
}
