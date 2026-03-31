package com.example.dreamscape.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamKeywordResponseDTO {

    private String keyword;
    private Long count;
}