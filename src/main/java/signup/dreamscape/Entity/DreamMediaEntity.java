package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity // 이 클래스가 디비 테이블임
@Getter // getXXX 자동생성
@Setter // setXXX 자동생성
@NoArgsConstructor // 빈 생성자 자동 생성 new DreamMediaEntity()
@AllArgsConstructor // 모든 필드 생성자 잗오 생성
@Builder

public class DreamMediaEntity {
    @Id //PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) //자동증가
    private Long mediaId;

    @Column // 디비 칼럼이랑 매핑
    private Long dreamId; // DreamEntity와 연결

    @Column
    private String mediaUrl;

    @Column
    private Integer rating; // 별점 (1~5점)

    @Column
    private String comment;
}
