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

    private String TextSummary;
    private String mood;
}