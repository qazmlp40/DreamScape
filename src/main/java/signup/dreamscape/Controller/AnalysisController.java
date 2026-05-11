package signup.dreamscape.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.DTO.SummaryRequestDTO;
import signup.dreamscape.Service.AnalysisService;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;


    // 꿈 요약
    @PostMapping("/summarize")  // ← @PostMapping으로 변경!
    public DreamResponseDTO analysis(@RequestBody SummaryRequestDTO request) { // SummaryRequestDTO 만들어서 코드도 수정 (로컬에서)

        return analysisService.summarizeText(
                request.getDreamId(),
                request.getDreamText()
        );
    }

    // 꿈 해몽
    @GetMapping("/interpret/{dreamId}")
    public DreamResponseDTO interpret(@PathVariable Long dreamId){
        System.out.println("summarize 들어옴");
        return analysisService.analyzeDream(dreamId);
    }
}
