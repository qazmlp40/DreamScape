package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import signup.dreamscape.Entity.DreamSymbolEntity;

import java.util.List;

public interface DreamSymbolRepository extends JpaRepository<DreamSymbolEntity, Long> {

    // 키워드 리스트에 해당하는 엔티티 조회
    List<DreamSymbolEntity> findByKeywordIn(List<String> keyword);

    // 전체 keyword 조회
    @Query("select s.keyword from DreamSymbolEntity s")
    List<String> findAllKeywords();

    // 형태소가 situation 컬럼에 포함된 행 검색
    @Query("""
            select s
            from DreamSymbolEntity s
            where s.keyword = :keyword
            and s.situation like %:morpheme%
            """)
    List<DreamSymbolEntity> findByKeywordAndSituation(
            @Param("keyword") String keyword,
            @Param("morpheme") String morpheme
    );
}