package signup.dreamscape.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.DTO.RatingRequestDTO;
import signup.dreamscape.Service.MediaService;

@Tag(name = "Media API", description = "꿈 기반 비디오 생성 및 미디어 평가 API")
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor // final 붙은 필드를 생상자로 자동 주입
public class MediaController {

    private final MediaService mediaService;

    @Operation(summary = "AI 비디오 생성", description = "꿈 내용을 바탕으로 시각화된 비디오를 생성합니다.")
    @PostMapping("/generate/vedio")
    public MediaResponseDTO generateVideo(@RequestParam Long dreamId) throws Exception { //DTO가 아닌 Param 방식 사용
        return mediaService.generateVideo(dreamId);
    }

    @Operation(summary = "미디어 별점 평가 저장", description = "생성된 결과물에 대한 사용자의 별점(1~5점)과 코멘트를 저장합니다.")
    @PostMapping("/rating")
    public ResponseEntity<String> saveRating(@Valid @RequestBody RatingRequestDTO dto) {

        mediaService.updateRating(dto);
        return ResponseEntity.ok("별점 저장");
    }
}
