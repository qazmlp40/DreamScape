package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamAnalysisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "dream_id")
    private DreamEntity dream;

    @Column(columnDefinition = "TEXT")
    private String interpretation;

    // private String TextSummary; -> 밑에 textSummary랑 중복이라서 제거
    private String mood;

    @Column(columnDefinition = "TEXT")
    private String textSummary;
}