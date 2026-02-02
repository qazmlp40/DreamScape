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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DreamService {

    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;

    public DreamResponseDTO createDream(Long userId, DreamRequestDTO dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. userId: " + userId));

        DreamEntity dream = DreamEntity.builder()
                .user(user)
                .title(dto.getTitle())
                .rawText(dto.getRawText())  // ✅ content → rawText
                .mood(dto.getMood())
                .tags(dto.getTags())
                .build();

        DreamEntity saved = dreamRepository.save(dream);

        return convertToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public DreamResponseDTO getDream(Long dreamId) {
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. dreamId: " + dreamId));
        return convertToResponseDTO(dream);
    }

    @Transactional(readOnly = true)
    public List<DreamResponseDTO> getDreamsByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. userId: " + userId));

        List<DreamEntity> dreams = dreamRepository.findByUserIdOrderByCreatedAtDesc(userId);  // ✅ 메서드명 유지

        return dreams.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public DreamResponseDTO updateDream(Long dreamId, DreamRequestDTO dto) {
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. dreamId: " + dreamId));

        dream.setTitle(dto.getTitle());
        dream.setRawText(dto.getRawText());  // ✅ content → rawText
        dream.setMood(dto.getMood());
        dream.setTags(dto.getTags());

        DreamEntity updated = dreamRepository.save(dream);
        return convertToResponseDTO(updated);
    }

    public void deleteDream(Long dreamId) {
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 꿈입니다. dreamId: " + dreamId));

        dreamRepository.delete(dream);
    }

    private DreamResponseDTO convertToResponseDTO(DreamEntity dream) {
        return DreamResponseDTO.builder()
                .dreamId(dream.getDreamId())
                .userId(dream.getUser().getUserId())
                .title(dream.getTitle())
                .rawText(dream.getRawText())  // ✅ content → rawText
                .mood(dream.getMood())
                .tags(dream.getTags())
                .aiSummary(dream.getAiSummary())
                .createdAt(dream.getCreatedAt())
                .updatedAt(dream.getUpdatedAt())
                .build();
    }
}
