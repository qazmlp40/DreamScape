// src/main/java/signup/dreamscape/Service/DreamService.java
package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.DreamRequestDTO;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Repository.DreamRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DreamService {

    private final DreamRepository dreamRepository;

    public DreamResponseDTO createDream(Long userId, DreamRequestDTO dto) {
        LocalDateTime now = LocalDateTime.now();

        System.out.println("createDream 실행됨");

        LocalDate recordedAt;

        if (dto.getRecordedAt() != null && !dto.getRecordedAt().isBlank()) {
            recordedAt = LocalDate.parse(dto.getRecordedAt());
        } else {
            recordedAt = LocalDate.now();
        } // 새로 추가

        DreamEntity saved = dreamRepository.save(
                DreamEntity.builder()
                        .userId(userId)
                        .title(dto.getTitle())
                        .rawText(dto.getRawText())
                        .mood(dto.getMood())
                        .aiSummary(null)     // DreamRequestDTO에 없으므로 일단 null
                        .createdAt(now)
                        .updatedAt(now)
                        .recordedAt(recordedAt) // 새로 추가
                        .build()
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public DreamResponseDTO getDream(Long dreamId) {
        DreamEntity entity = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Dream not found: " + dreamId));
        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<DreamResponseDTO> getDreamsByUser(Long userId) {
        return dreamRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    // 새로 추가: 캘린더용 특정 날짜 조회
    @Transactional(readOnly = true)
    public List<DreamResponseDTO> getDreamsByDate(Long userId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        return dreamRepository
                .findByUserIdAndRecordedAt(userId, localDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 새로 추가: 차트용 월별 조회
    @Transactional(readOnly = true)
    public List<DreamResponseDTO> getDreamsByMonth(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return dreamRepository
                .findByUserIdAndRecordedAtBetween(userId, start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DreamResponseDTO updateDream(Long dreamId, DreamRequestDTO dto) {
        DreamEntity entity = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Dream not found: " + dreamId));

        entity.setTitle(dto.getTitle());
        entity.setRawText(dto.getRawText());
        entity.setUpdatedAt(LocalDateTime.now());
        // aiSummary는 dto에 없으니 기존 값 유지

        DreamEntity saved = dreamRepository.save(entity);
        return toResponse(saved);
    }

    public void deleteDream(Long dreamId) {
        if (!dreamRepository.existsById(dreamId)) {
            throw new IllegalArgumentException("Dream not found: " + dreamId);
        }
        dreamRepository.deleteById(dreamId);
    }

    private DreamResponseDTO toResponse(DreamEntity e) {
        return DreamResponseDTO.builder()
                .dreamId(e.getDreamId())
                .userId(e.getUserId())
                .title(e.getTitle())
                .rawText(e.getRawText())
                .aiSummary(e.getAiSummary())
                .createdAt(e.getCreatedAt())
                // .recordedAt(e.getRecordedAt().atStartOfDay()) // recordedAt을 createdAt으로 매핑(현 시점)
                .recordedAt(
                        e.getRecordedAt() != null
                                ? e.getRecordedAt().atStartOfDay()
                                : e.getCreatedAt()
                )
                .aiInterpretation(null)
                .mood(e.getMood())
                .tag(null)
                .originalMediaUrl(null)
                .editedMediaUrl(null)
                .build();
    }
}
