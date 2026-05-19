package signup.dreamscape.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "생성된 영상 정보 응답")
public class MediaResponseDTO {

    @Schema(description = "미디어(이미지/영상) 접근 URL", example = "https://s3.cloud.com/media/result_01.jpg")
    private String mediaUrl;

    @Schema(description = "미디어 고유 식별 ID", example = "505")
    private Long mediaId;
}
