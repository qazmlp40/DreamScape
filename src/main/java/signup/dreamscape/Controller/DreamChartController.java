package signup.dreamscape.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import signup.dreamscape.DTO.DreamChartRequestDTO;
import signup.dreamscape.DTO.DreamChartResponseDTO;
import signup.dreamscape.Service.DreamChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Chart API", description = "꿈 분석 차트 및 통계 데이터 조회 API")
@RestController
@RequestMapping("/api/chart")
@RequiredArgsConstructor
public class DreamChartController {

    private final DreamChartService dreamChartService;

    @Operation(summary = "꿈 차트 데이터 조회", description = "주간/월간 단위의 감정 분포와 자주 등장한 키워드 Top 3를 반환합니다.")
    @GetMapping("/dream-chart")
    public ResponseEntity<DreamChartResponseDTO> getDreamChart(@Valid DreamChartRequestDTO request) {
        DreamChartResponseDTO response = dreamChartService.getChartData(request);
        return ResponseEntity.ok(response);
    }
}
