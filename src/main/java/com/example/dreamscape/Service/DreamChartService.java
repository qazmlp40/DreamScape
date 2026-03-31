package com.example.dreamscape.Service;

import com.example.dreamscape.DTO.DreamChartRequestDTO;
import com.example.dreamscape.DTO.DreamChartResponseDTO;
import com.example.dreamscape.DTO.DreamKeywordResponseDTO;
import com.example.dreamscape.Repository.DreamAnalysisRepository;
import com.example.dreamscape.Repository.DreamSymbolMapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DreamChartService {

    private final DreamAnalysisRepository dreamAnalysisRepository;
    private final DreamSymbolMapRepository dreamSymbolMapRepository;

    // 고정된 감정 순서
    private static final String[] MOOD_ORDER = {
            "행복", "슬픔", "분노", "공포", "미묘", "감동", "신남"
    };

    public DreamChartResponseDTO getChartData(DreamChartRequestDTO request) {

        // 1) baseDate 기본값 처리
        LocalDate baseDate = request.getBaseDate();
        if (baseDate == null) {
            baseDate = LocalDate.now();
        }

        // 2) rangeType에 따른 날짜 범위 계산 → LocalDateTime으로 변환
        LocalDateTime endDate = baseDate.atTime(23, 59, 59);
        LocalDateTime startDate;

        switch (request.getRangeType().toUpperCase()) {
            case "MONTHLY":
                startDate = baseDate.minusMonths(1).atStartOfDay();
                break;
            case "WEEKLY":
            default:
                startDate = baseDate.minusWeeks(1).atStartOfDay();
                break;
        }

        // 3) 감정 분포 조회
        List<Object[]> moodResults = dreamAnalysisRepository.findMoodDistribution(
                request.getUserId(), startDate, endDate
        );

        // 4) LinkedHashMap으로 고정 순서
        Map<String, Long> moodDistribution = new LinkedHashMap<>();
        for (String mood : MOOD_ORDER) {
            moodDistribution.put(mood, 0L);
        }
        for (Object[] row : moodResults) {
            String mood = (String) row[0];
            Long count = (Long) row[1];
            if (moodDistribution.containsKey(mood)) {
                moodDistribution.put(mood, count);
            }
        }

        // 5) 키워드 Top 3 조회
        List<DreamKeywordResponseDTO> topKeywords = dreamSymbolMapRepository.findTopKeywords(
                request.getUserId(), startDate, endDate, PageRequest.of(0, 3)
        );

        // 6) 응답 DTO 생성
        return new DreamChartResponseDTO(moodDistribution, topKeywords);
    }
}
