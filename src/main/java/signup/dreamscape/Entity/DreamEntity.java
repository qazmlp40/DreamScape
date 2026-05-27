// src/main/java/signup/dreamscape/Entity/DreamEntity.java
package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @Column(columnDefinition = "TEXT")
    private String rawText;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private Long userId; // 실제로는 user테이블과 일대다연결

    @Column
    private String mood; // 감정 태그를 여기다가 저장한다

    @Column
    private LocalDate recordedAt; // 날짜만 저장 추가 (2026-05-27), 사용자가 선택한 꿈 날짜
}
