package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "미디어 별점 및 평가 요청")
public class RatingRequestDTO {

    @NotNull
    @Schema(description = "평가 대상 미디어(이미지/영상) ID", example = "101")
    private Long mediaId;

    @NotNull
    @Min(value = 1, message = "별점은 최소 1점 이상이어야 합니다.")
    @Max(value = 5, message = "별점은 최대 5점 이하이어야 합니다.")
    @Schema(description = "부여할 별점 (1~5점)", example = "5")
    private Integer rating;

    @Schema(description = "미디어에 대한 한 줄 평", example = "분석 결과와 이미지가 너무 잘 어울려요!")
    private String comment;
}
