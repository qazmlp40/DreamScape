package signup.dreamscape.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.Service.MediaService;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/generate/video")
    public MediaResponseDTO generateVideo(@RequestParam Long dreamId) {
        return mediaService.generateVideo(dreamId);
    }
}
