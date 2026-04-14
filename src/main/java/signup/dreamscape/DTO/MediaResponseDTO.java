package signup.dreamscape.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaResponseDTO {
    private String mediaUrl;
    private Long mediaId;
}
