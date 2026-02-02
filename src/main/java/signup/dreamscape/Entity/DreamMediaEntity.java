package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "dream_media")
public class DreamMediaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")                 // PK 컬럼명: media_id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id", nullable = false)
    private DreamEntity dream;

    @Column(name = "media_type", length = 50)
    private String mediaType;                  // VIDEO/IMAGE 등

    @Column(name = "media_url", columnDefinition = "TEXT")
    private String mediaUrl;                   // 실제 영상 URL(선택)

    // Hailuo 연동 필드
    private String provider;                   // "hailuo"
    private String taskId;                     // 외부 작업 ID
    private String status;                     // waiting/processing/succeed/failed
    private String url;                        // 최종 영상 URL

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist void onCreate() { this.createdAt = Instant.now(); }
    @PreUpdate  void onUpdate() { this.updatedAt = Instant.now(); }
}
