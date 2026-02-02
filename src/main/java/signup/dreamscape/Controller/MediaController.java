package signup.dreamscape.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.Entity.DreamMediaEntity;
import signup.dreamscape.Service.MediaGenerationService;
import signup.dreamscape.Service.MediaService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private final MediaGenerationService mediaGenerationService;

    // 간단 헬스체크
    @GetMapping("/ping")
    public String ping() {
        return "media ok";
    }

    // (선택) 더미 미디어 생성 – 기존 로직 유지용
    @PostMapping("/test/{dreamId}")
    public ResponseEntity<MediaResponseDTO> createDummyMedia(@PathVariable Long dreamId) {
        MediaResponseDTO response = mediaService.createDummyMedia(dreamId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{dreamId}/generate")
    public ResponseEntity<?> generate(
            @PathVariable Long dreamId,
            @RequestParam(value = "prompt", required = false) String promptParam,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        // 1) 쿼리스트링 우선 → 2) JSON body
        String prompt = promptParam;
        if ((prompt == null || prompt.isBlank()) && body != null) {
            Object p = body.get("prompt");
            if (p != null) prompt = String.valueOf(p);
        }
        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "prompt is required",
                    "hint", "use query ?prompt=... or JSON body {\"prompt\":\"...\"}"
            ));
        }

        // 실제 생성 로직
        DreamMediaEntity media = mediaGenerationService.generateForDream(dreamId, prompt);

        // 안전한 응답 생성
        Map<String, Object> response = new HashMap<>();
        response.put("id", media.getId());
        response.put("dreamId", media.getDream() != null ? media.getDream().getDreamId() : null);
        response.put("status", media.getStatus());
        response.put("mediaType", media.getMediaType());
        response.put("url", media.getUrl());

        return ResponseEntity.ok(response);
    }
}
