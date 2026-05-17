// src/main/java/signup/dreamscape/Service/DreamService.java
package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.DreamRequestDTO;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Repository.DreamRepository;

import java.time.LocalDate; // 로컬에서 추가 (26.05.09)
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DreamService {

    private final DreamRepository dreamRepository;

    public DreamResponseDTO createDream(Long userId, DreamRequestDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        // 프론트에서 선택한 꿈 날짜가 있으면 사용하고, 없으면 오늘 날짜로 저장
        // 로컬에서 추가 (26.05.09)
        LocalDate dreamDate = dto.getDate() != null ? dto.getDate() : now.toLocalDate();

        DreamEntity saved = dreamRepository.save(
                DreamEntity.builder()
                        .userId(userId)
                        .title(dto.getTitle())
                        .rawText(dto.getRawText())
                        .mood(dto.getMood())
                        .aiSummary(null)
                        .date(dreamDate) // 로컬에서 추가 (26.05.09)
                        .createdAt(now)
                        .updatedAt(now)
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

    public DreamResponseDTO updateDream(Long dreamId, DreamRequestDTO dto) {
        DreamEntity entity = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Dream not found: " + dreamId));

        // 수정 전
//        entity.setTitle(dto.getTitle());
//        entity.setRawText(dto.getRawText());
//        entity.setUpdatedAt(LocalDateTime.now());
//        // aiSummary는 dto에 없으니 기존 값 유지

        // 수정 후 - 로컬에서 수정 (26.05.17)
        // DreamService.updateDream()에 저장 로직 추가
        if (dto.getTitle() != null) {
            entity.setTitle(dto.getTitle());
        }

        if (dto.getRawText() != null) {
            entity.setRawText(dto.getRawText());
        }

        if (dto.getMood() != null) {
            entity.setMood(dto.getMood());
        }

        String summary = dto.getAiSummary() != null ? dto.getAiSummary() : dto.getSummary();
        if (summary != null) {
            entity.setAiSummary(summary);
        }

        String interpretation = dto.getAiInterpretation() != null
                ? dto.getAiInterpretation()
                : dto.getInterpretation(); // 여기 에러뜸
        if (interpretation != null) {
            entity.setAiInterpretation(interpretation);
        }

        String mediaUrl = dto.getMediaUrl() != null ? dto.getMediaUrl() : dto.getVideoUrl();
        if (mediaUrl != null) {
            entity.setMediaUrl(mediaUrl);
        }

        entity.setUpdatedAt(LocalDateTime.now());

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
                .date(e.getDate()) // 로컬에서 추가 (26.05.09)
                .createdAt(e.getCreatedAt())
                .recordedAt(e.getCreatedAt())
                .aiInterpretation(e.getAiInterpretation()) // 로컬에서 수정 (26.05.17) - null 대신 실제 값 내려주기
                .mood(e.getMood())
                .tag(null)
                .originalMediaUrl(e.getMediaUrl()) // 로컬에서 수정 (26.05.17)
                .editedMediaUrl(e.getMediaUrl()) // 로컬에서 수정 (26.05.17)
                .build();
    }
}
