package signup.dreamscape.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드 포함한 생성자 자동 생성
@Builder // 빌더 패턴으로 객체 생성
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

