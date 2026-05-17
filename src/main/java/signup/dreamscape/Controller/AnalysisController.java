package signup.dreamscape.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.DTO.SummaryRequestDTO;
import signup.dreamscape.Service.AnalysisService;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;


//    // 꿈 요약 전 버전
//    @PostMapping("/summary")  // ← @PostMapping으로 변경!
//    public DreamResponseDTO analysis(@RequestBody String dreamText) {
//
//        return analysisService.summarizeText(dreamText);
//    }

    // 꿈 요약 서연님 버전으로 고친거
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

        return analysisService.analyzeDream(dreamId);
    }
}
