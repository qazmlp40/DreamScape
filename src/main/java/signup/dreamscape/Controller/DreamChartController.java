package signup.dreamscape.Controller;

import jakarta.validation.Valid;
import signup.dreamscape.DTO.DreamChartRequestDTO;
import signup.dreamscape.DTO.DreamChartResponseDTO;
import signup.dreamscape.Service.DreamChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chart")
@RequiredArgsConstructor
public class DreamChartController {

    private final DreamChartService dreamChartService;

    @GetMapping("/dream-chart")
    public ResponseEntity<DreamChartResponseDTO> getDreamChart(@Valid DreamChartRequestDTO request) {
        DreamChartResponseDTO response = dreamChartService.getChartData(request);
        return ResponseEntity.ok(response);
    }
}
