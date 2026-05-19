package signup.dreamscape.Controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import signup.dreamscape.DTO.DreamResponseDTO;
import signup.dreamscape.DTO.SummaryRequestDTO;
import signup.dreamscape.Service.AnalysisService;

@Tag(name = "Analysis API", description = "AI 꿈 요약 및 해몽 API")
@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;


    // 꿈 요약
    @Operation(summary = "꿈 내용 요약", description = "사용자가 작성한 꿈의 원문을 AI가 핵심만 요약합니다.")
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
    @Operation(summary = "꿈 해몽 요청", description = "저장된 꿈 ID를 기반으로 AI 해몽 결과를 반환합니다.")
    @GetMapping("/interpret/{dreamId}")
    public DreamResponseDTO interpret(
            @Parameter(description = "해몽할 꿈의 고유 ID", example = "1")
            @PathVariable Long dreamId){

        return analysisService.analyzeDream(dreamId);
    }
}
