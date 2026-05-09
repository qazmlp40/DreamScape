package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드 포함한 생성자 자동 생성
@Builder // 빌더 패턴으로 객체 생성
public class DreamSymbolEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column
    private String keyword;
    // 꿈 내용에서 감지될 단어

    @Column
    private String meaning;
    // 상징의 기본 의미

    @Column(columnDefinition = "TEXT")
    private String situation;
    // 형태소 키워드 ex) "꼬리, 잡다"

    @Column(columnDefinition = "TEXT")
    private String meaningContext;
    // 상황별 상세 해석
}