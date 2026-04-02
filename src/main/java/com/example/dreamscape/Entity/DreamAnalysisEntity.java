package com.example.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드 포함한 생성자 자동 생성
@Builder // 빌더 패턴으로 객체 생성
public class DreamAnalysisEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long analysisId;   // PK, 해몽 고유 ID

    @Column
    private String textSummary;   // 꿈 요약, 이거 배열이나 리스트나 변수 3개로 바꿀 예정

    @Column
    private String mood;          // 감정 태그

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dreamId") // 외래키(FK)
    private DreamEntity dream;
}
