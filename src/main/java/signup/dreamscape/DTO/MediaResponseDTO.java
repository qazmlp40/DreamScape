package signup.dreamscape.DTO;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaResponseDTO {
    private Long id;
    private String mediaType;
    private String mediaurl;
}
