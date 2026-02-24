package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.DreamRequestDTO;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Entity.UserEntity;
import signup.dreamscape.Repository.DreamRepository;
import signup.dreamscape.Repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DreamService {

    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;

    public DreamResponseDTO createDream(Long userId, DreamRequestDTO dto) {
        // 유저 존재 검증(선택이지만 보통 하는 게 안전)
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 userId: " + userId));

        LocalDateTime now = LocalDateTime.now();

        DreamEntity dream = DreamEntity.builder()
                .title(dto.getTitle())
                .rawText(dto.getRawText())
                .aiSummary(null)
                .createdAt(now)
                .updatedAt(now)
                .userId(user.getUserId()) // DreamEntity가 Long userId 구조라서 이걸로
                .build();

        DreamEntity saved = dreamRepository.save(dream);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public DreamResponseDTO getDream(Long dreamId) {
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 dreamId: " + dreamId));

        return toResponseDTO(dream);
    }

    @Transactional(readOnly = true)
    public List<DreamResponseDTO> getDreamsByUser(Long userId) {
        // 선택: userId 검증 (원치 않으면 이 블록 삭제 가능)
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("존재하지 않는 userId: " + userId);
        }

        return dreamRepository.findByUserId(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public DreamResponseDTO updateDream(Long dreamId, DreamRequestDTO dto) {
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 dreamId: " + dreamId));

        dream.setTitle(dto.getTitle());
        dream.setRawText(dto.getRawText());
        dream.setUpdatedAt(LocalDateTime.now());

        DreamEntity saved = dreamRepository.save(dream);
        return toResponseDTO(saved);
    }

    public void deleteDream(Long dreamId) {
        if (!dreamRepository.existsById(dreamId)) {
            throw new IllegalArgumentException("존재하지 않는 dreamId: " + dreamId);
        }
        dreamRepository.deleteById(dreamId);
    }

    private DreamResponseDTO toResponseDTO(DreamEntity dream) {
        return DreamResponseDTO.builder()
                .dreamId(dream.getDreamId())
                .title(dream.getTitle())
                .rawText(dream.getRawText())
                .aiSummary(dream.getAiSummary())
                .createdAt(dream.getCreatedAt())
                .updatedAt(dream.getUpdatedAt())
                .userId(dream.getUserId())
                .build();
    }
}
