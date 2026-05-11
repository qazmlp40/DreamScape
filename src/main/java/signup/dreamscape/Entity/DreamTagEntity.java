package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드 포함한 생성자 자동 생성
@Builder // 빌더 패턴으로 객체 생성
public class DreamTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tagId; // PK (자동 증가)

    @Column
    private String tagName; // 태그 이름 (예: "기분 좋음")

    @Column
    private String tagImage; // 태그 이미지 URL (예: 캘린더에 표시될 아이콘)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dreamId") // 외래키(FK)
    private DreamEntity dream;
}
