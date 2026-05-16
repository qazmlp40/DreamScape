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

<<<<<<< HEAD
    // 키워드에 해당하는 meaning 가져오는 메서드
    // 반환은 엔티티 전체가 됨
    List<DreamSymbolEntity> findByKeywordIn(List<String> keyword);

    // 형태소가 situation 컬럼에 포함된 행 검색
    @Query("select s from DreamSymbolEntity s where s.keyword = :keyword and s.situation like %:morepheme%")
    List<DreamSymbolEntity> findByKeywordAndSituation(String keyword, String morepheme);

}
=======
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
>>>>>>> 2e12e88 (영상화 merge 전 환경변수 적용)
