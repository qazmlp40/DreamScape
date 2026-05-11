package signup.dreamscape.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.Service.MediaService;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor // final 붙은 필드를 생상자로 자동 주입
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/generate/video")
    public MediaResponseDTO generateVideo(@RequestParam Long dreamId) { //DTO가 아닌 Param 방식 사용
        return mediaService.generateVideo(dreamId);
    }
}
