package signup.dreamscape.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamChartRequestDTO {

    private Long userId;

    @NotBlank(message = "rangeType은 필수 값입니다 (WEEKLY 또는 MONTHLY).")
    private String rangeType;

    private LocalDate baseDate;
}