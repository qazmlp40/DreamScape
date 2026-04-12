package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dream_symbol_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamSymbolMapEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id", nullable = false)
    private DreamEntity dream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "symbol_id", nullable = false)
    private DreamSymbolEntity symbol;
}