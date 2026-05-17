// src/main/java/signup/dreamscape/Entity/DreamEntity.java
package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate; // 로컬에서 추가

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
    private LocalDateTime createdAt; // DB 레코드 생성 시각

    @Column
    private LocalDateTime updatedAt; // DB 레코드 수정 시각

    @Column
    private Long userId; // 실제로는 user테이블과 일대다연결
    
    private String mood; // 로컬에서 추가

    @Column(name = "dream_date") // 로컬에서 추가 (26.05.09)
    private LocalDate date; // 사용자가 선택한 꿈 날짜

    @Column
    private String aiInterpretation; // 로컬에서 추가 (26.05.17)

    @Column
    private String mediaUrl; // 로컬에서 추가 (26.05.17)
}
