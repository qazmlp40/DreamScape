package com.example.dreamscape.Repository;

import com.example.dreamscape.DTO.DreamKeywordResponseDTO;
import com.example.dreamscape.Entity.DreamSymbolMapEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface DreamSymbolMapRepository extends JpaRepository<DreamSymbolMapEntity, Long> {

    @Query("SELECT new com.example.dreamscape.DTO.DreamKeywordResponseDTO(ds.symbol.keyword, COUNT(ds)) " +
            "FROM DreamSymbolMapEntity ds " +
            "WHERE ds.dream.userId = :userId " +
            "AND ds.dream.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY ds.symbol.keyword " +
            "ORDER BY COUNT(ds) DESC")
    List<DreamKeywordResponseDTO> findTopKeywords(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate,
                                                  Pageable pageable);
}
