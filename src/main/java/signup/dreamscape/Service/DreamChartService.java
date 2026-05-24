package signup.dreamscape.Service;

import signup.dreamscape.DTO.DreamChartRequestDTO;
import signup.dreamscape.DTO.DreamChartResponseDTO;
import signup.dreamscape.DTO.DreamKeywordResponseDTO;
import signup.dreamscape.Repository.DreamAnalysisRepository;
import signup.dreamscape.Repository.DreamSymbolMapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
        LocalDate baseDate = request.getBaseDate() != null ? request.getBaseDate() : LocalDate.now();

        // 2) rangeType에 따른 날짜 범위 계산 → LocalDateTime으로 변환
        LocalDateTime endDate = baseDate.atTime(LocalTime.MAX);
        LocalDateTime startDate = calculateStartDate(baseDate, request.getRangeType());

        // 3) 감정 분포 데이터 조회 및 매핑
        Map<String, Long> moodDistribution = getMoodDistribution(request.getUserId(), startDate, endDate);

        // 4) 키워드 조회
        List<DreamKeywordResponseDTO> topKeywords = dreamSymbolMapRepository.findTopKeywords(
                request.getUserId(), startDate, endDate, PageRequest.of(0, 15)
        );

        // 6) 응답 DTO 생성
        return new DreamChartResponseDTO(moodDistribution, topKeywords);
    }

    // rangeType에 따른 시작일 계산
    private LocalDateTime calculateStartDate(LocalDate baseDate, String rangeType) {
        // NullPointerException 방지를 위해 equalsIgnoreCase 사용
        if ("MONTHLY".equalsIgnoreCase(rangeType)) {
            return baseDate.minusMonths(1).atStartOfDay();
        }
        // 그 외의 경우(WEEKLY 포함) 기본적으로 1주일 전으로 계산
        return baseDate.minusWeeks(1).atStartOfDay();
    }

    // DB에서 감정 데이터를 가져와서 고정된 순서(Map)에 맞게 세팅
    private Map<String, Long> getMoodDistribution(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> moodResults = dreamAnalysisRepository.findMoodDistribution(userId, startDate, endDate);

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
        return moodDistribution;
    }
}

