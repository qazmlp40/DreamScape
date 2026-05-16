package signup.dreamscape.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.Service.AnalysisService;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;


    // 꿈 요약
    @PostMapping("/summary")  // ← @PostMapping으로 변경!
    public DreamResponseDTO analysis(@RequestBody String dreamText) {

        return analysisService.summarizeText(dreamText);
    }

    // 꿈 해몽
    @GetMapping("/interpret/{dreamId}")
    public DreamResponseDTO interpret(@PathVariable Long dreamId){

        return analysisService.analyzeDream(dreamId);
    }
}
