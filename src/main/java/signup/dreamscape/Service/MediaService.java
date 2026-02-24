package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Entity.DreamMediaEntity;
import signup.dreamscape.Repository.DreamMediaRepository;
import signup.dreamscape.Repository.DreamRepository;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final DreamRepository dreamRepository;
    private final DreamMediaRepository dreamMediaRepository;

    @Transactional
    public MediaResponseDTO generateVideo(Long dreamId) {

        // dream 존재 검증
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 dreamId 입니다: " + dreamId));

        String dummyUrl = "https://example.com/dummy-video.mp4";

        DreamMediaEntity media = DreamMediaEntity.builder()
                .dreamId(dream.getDreamId()) // ✅ Flat 방식
                .mediaUrl(dummyUrl)
                .build();

        DreamMediaEntity saved = dreamMediaRepository.save(media);

        return MediaResponseDTO.builder()
                .mediaUrl(saved.getMediaUrl()) // ✅ DTO 필드가 mediaUrl 하나면 이것만
                .build();
    }
}
