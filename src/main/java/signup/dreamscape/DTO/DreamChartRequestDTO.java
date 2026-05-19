package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.boot.model.source.spi.IdentifierSourceSimple;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "꿈 차트 및 통계 조회 요청 DTO")
public class DreamChartRequestDTO {

    @Schema(description = "사용자 고유 ID", example = "1")
    private Long userId;

    @NotBlank(message = "rangeType은 필수 값입니다 (WEEKLY 또는 MONTHLY).")
    @Schema(description = "조회 범위 (WEEKLY OR MONTHLY" , example = "WEEKLY")
    private String rangeType;

    @Schema(description = "조회 기준일", example = "2026-05-15")
    private LocalDate baseDate;
}