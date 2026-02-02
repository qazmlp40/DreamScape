package signup.dreamscape.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
    public MediaResponseDTO createDummyMedia(Long dreamId) {

        // 1. Dream 조회
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 dreamId 입니다: " + dreamId));

        // 2. 1차 구현 - Dummy 데이터
        String dummyUrl = "https://example.com/dummy-video.mp4";
        String mediaType = "VIDEO";

        // 3. DreamMedia 엔티티 생성
        DreamMediaEntity media = DreamMediaEntity.builder()
                .dream(dream)
                .mediaType(mediaType)
                .mediaUrl(dummyUrl)
                .build();

        // 4. 저장
        DreamMediaEntity saved = dreamMediaRepository.save(media);

        // 5. 엔티티 -> DTO 변환
        return MediaResponseDTO.builder()
                .id(saved.getId())
                .mediaType(saved.getMediaType())
                .mediaurl(saved.getMediaUrl())
                .build();
    }
}
