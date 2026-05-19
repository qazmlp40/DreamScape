package signup.dreamscape.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Dream API", description = "꿈 기록 관리 API (생성, 조회, 수정, 삭제)")
@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService dreamService;
    private final MediaService mediaService;

    // 유저별 꿈 목록 조회
    @Operation(summary = "특정 유저의 전체 꿈 목록 조회")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DreamResponseDTO>> getDreamsByUser(
            @Parameter(description = "조회할 유저 ID")
            @PathVariable Long userId) {

        List<DreamResponseDTO> response = dreamService.getDreamsByUser(userId);
        return ResponseEntity.ok(response);
    }

    // 꿈 생성
    @Operation(summary = "새로운 꿈 기록 생성")
    @PostMapping("/{userId}")
    public ResponseEntity<DreamResponseDTO> createDream(
            @Parameter(description = "꿈을 기록할 유저 ID")
            @PathVariable Long userId,
            @RequestBody DreamRequestDTO dto) {

        DreamResponseDTO response = dreamService.createDream(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 꿈 단건 조회
    @Operation(summary = "특정 꿈 단건 상세 조회")
    @GetMapping("/{dreamId}")
    public ResponseEntity<DreamResponseDTO> getDream(
            @Parameter(description = "조회할 꿈 고유 ID")
            @PathVariable Long dreamId) {

        DreamResponseDTO response = dreamService.getDream(dreamId);
        return ResponseEntity.ok(response);
    }

    // 꿈 수정
    @Operation(summary = "기존 꿈 기록 수정")
    @PutMapping("/{dreamId}")
    public ResponseEntity<DreamResponseDTO> updateDream(
            @Parameter(description = "수정할 꿈 고유 ID")
            @PathVariable Long dreamId,
            @RequestBody DreamRequestDTO dto) {

        DreamResponseDTO response = dreamService.updateDream(dreamId, dto);
        return ResponseEntity.ok(response);
    }

    // 꿈 삭제
    @Operation(summary = "특정 꿈 기록 삭제")
    @DeleteMapping("/{dreamId}")
    public ResponseEntity<Void> deleteDream(
            @Parameter(description = "삭제할 꿈 고유 ID")
            @PathVariable Long dreamId) {

        dreamService.deleteDream(dreamId);
        return ResponseEntity.noContent().build();
    }

    // (테스트용) dreamId로 더미 비디오 생성
    @PostMapping("/media-test/{dreamId}")
    public ResponseEntity<MediaResponseDTO> generateVideoFromDreamController(
            @PathVariable Long dreamId
    ) {
        MediaResponseDTO response = mediaService.generateVideo(dreamId);
        return ResponseEntity.ok(response);
    }
}
