package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamSymbolEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword;

    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String situation;
    // 형태소 키워드 ex) "꼬리, 잡다"

    @Column(columnDefinition = "TEXT")
    private String meaningContext;
    // 상황별 상세 해석

}