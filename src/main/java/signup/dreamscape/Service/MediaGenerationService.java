package signup.dreamscape.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import signup.dreamscape.Entity.DreamEntity;
import signup.dreamscape.Entity.DreamMediaEntity;
import signup.dreamscape.Repository.DreamMediaRepository;
import signup.dreamscape.Repository.DreamRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class MediaGenerationService {

    private final DreamRepository dreamRepository;
    private final DreamMediaRepository dreamMediaRepository;

    public DreamMediaEntity generateForDream(Long dreamId, String prompt) {
        // 1. Dream 조회
        DreamEntity dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Dream not found: " + dreamId));

        // 2. 더미 미디어 URL 및 타입 지정
        String dummyUrl = "https://example.com/dummy-video.mp4";
        String mediaType = "VIDEO";

        // 3. DreamMediaEntity 생성 및 저장
        DreamMediaEntity media = DreamMediaEntity.builder()
                .dream(dream)
                .mediaType(mediaType)
                .mediaUrl(dummyUrl)
                .build();

        return dreamMediaRepository.save(media);
    }
}