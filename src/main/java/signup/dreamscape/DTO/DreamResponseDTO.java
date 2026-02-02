package signup.dreamscape.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DreamResponseDTO {

    private Long dreamId;
    private Long userId;
    private String title;
    private String rawText;  // ✅ content → rawText
    private String mood;
    private List<String> tags;
    private String aiSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void setAiSummary(String summaryText) {
    }

    public void setAiInterpretation(String interpretation) {

    }
}
