package com.example.dreamscape.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamChartRequestDTO {

    private Long userId;
    private String rangeType;
    private LocalDate baseDate;
}