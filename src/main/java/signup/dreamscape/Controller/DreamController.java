package signup.dreamscape.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.DreamRequestDTO;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.DTO.MediaResponseDTO;
import signup.dreamscape.Service.DreamService;
import signup.dreamscape.Service.MediaService;

import java.util.List;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService dreamService;
    private final MediaService mediaService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DreamResponseDTO>> getDreamsByUser(@PathVariable Long userId) {
        List<DreamResponseDTO> response = dreamService.getDreamsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<DreamResponseDTO> createDream(
            @PathVariable Long userId,
            @RequestBody DreamRequestDTO dto) {
        DreamResponseDTO response = dreamService.createDream(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{dreamId}")
    public ResponseEntity<DreamResponseDTO> getDream(@PathVariable Long dreamId) {
        DreamResponseDTO response = dreamService.getDream(dreamId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{dreamId}")
    public ResponseEntity<DreamResponseDTO> updateDream(
            @PathVariable Long dreamId,
            @RequestBody DreamRequestDTO dto) {
        DreamResponseDTO response = dreamService.updateDream(dreamId, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{dreamId}")
    public ResponseEntity<Void> deleteDream(@PathVariable Long dreamId) {
        dreamService.deleteDream(dreamId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/media-test/{dreamId}")
    public ResponseEntity<MediaResponseDTO> createDummyMediaFromDreamController(
            @PathVariable Long dreamId) {
        MediaResponseDTO response = mediaService.createDummyMedia(dreamId);
        return ResponseEntity.ok(response);
    }

}
