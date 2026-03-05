// src/main/java/signup/dreamscape/Entity/DreamEntity.java
package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dreamId; // PK

    @Column
    private String title; // 꿈 제목

    @Column
    private String rawText; // 사용자가 입력한 원본 꿈 내용

    @Column
    private String aiSummary; // AI 요약 결과

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private Long userId; // 실제로는 user테이블과 일대다연결
}
