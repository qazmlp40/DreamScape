package signup.dreamscape.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import signup.dreamscape.Entity.DreamSymbolEntity;

import java.util.List;

// 커스템 메소드 추가
public interface DreamSymbolRepository extends JpaRepository<DreamSymbolEntity, Long> {

    //DreamSymbol 테이블에서 keyword만 가져오는 메서드
    @Query("select s.keyword from DreamSymbolEntity s")
    List<String> findAllKeywords();

    // 키워드에 해당하는 meaning 가져오는 메서드
    // 반환은 엔티티 전체가 됨
    List<DreamSymbolEntity> findByKeywordIn(List<String> keyword);
}
