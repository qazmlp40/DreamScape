import { API_BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import { useDreamRecord } from "../../contexts/DreamRecordContext";

/* ----------------------- Types ----------------------- */
type EmotionKey =
  | "happy"
  | "sad"
  | "anger"
  | "fear"
  | "mixed"
  | "touched"
  | "excited";

// interface DreamKeywordItem {
//   dreamSummary: string;
//   interpretation: string;
// }

interface DreamKeywordItem {
  keyword: string;
  count: number;
}

interface DreamChartResponse {
  moodDistribution: Record<string, number>;
  topKeywords: DreamKeywordItem[];
}

/* ----------------------- Mock Data ----------------------- */

// 감정 이모지 PNG 파일들
const emotionImages = {
  happy: require("../../assets/images/icons/emotion_icon/happy_icon.png"),
  sad: require("../../assets/images/icons/emotion_icon/Sad_icon.png"),
  anger: require("../../assets/images/icons/emotion_icon/anger_icon.png"),
  fear: require("../../assets/images/icons/emotion_icon/Scared_icon.png"),
  mixed: require("../../assets/images/icons/emotion_icon/Ambiguous_icon.png"),
  touched: require("../../assets/images/icons/emotion_icon/Impressed_icon.png"),
  excited: require("../../assets/images/icons/emotion_icon/Excitement_icon.png"),
};

/* ----------------------- useScale (내장) ----------------------- */

const BASE_WIDTH = 412; // 피그마 화면의 넓이

function useScale() {
  const width = useWindowDimensions().width; // 현재 기기의 화면 넓이

  const s = (px: number) => px * (width / BASE_WIDTH);

  return { s, width };
}

/* ----------------------- Up_Arrow / Under_Arrow (내장) ----------------------- */

function Up_Arrow() {
  const { s } = useScale();
  const W = 23,
    H = 12;
  return (
    <Svg width={s(W)} height={s(H)} viewBox="0 0 24 13" fill="none">
      <Path
        d="M22.3084 12.6658C22.043 12.667 21.7882 12.5613 21.6017 12.3725L11.6417 2.41245L1.68172 12.3725C1.28771 12.7396 0.67371 12.7288 0.292894 12.3479C-0.087922 11.9671 -0.0987553 11.3531 0.26839 10.9591L10.9351 0.292453C11.3255 -0.0974845 11.958 -0.0974845 12.3484 0.292453L23.0151 10.9591C23.405 11.3495 23.405 11.982 23.0151 12.3725C22.8285 12.5613 22.5738 12.667 22.3084 12.6658Z"
        fill="black"
      />
    </Svg>
  );
}

function Under_Arrow() {
  const { s } = useScale();
  const W = 23,
    H = 12;

  return (
    <Svg width={s(W)} height={s(H)} viewBox="0 0 24 13" fill="none">
      <Path
        d="M11.6417 12.6417C11.3763 12.643 11.1216 12.5372 10.9351 12.3484L0.26839 1.68172C-0.0987553 1.28771 -0.087922 0.67371 0.292894 0.292894C0.67371 -0.087922 1.28771 -0.0987553 1.68172 0.26839L11.6417 10.2284L21.6017 0.26839C21.9957 -0.0987553 22.6097 -0.087922 22.9906 0.292894C23.3714 0.67371 23.3822 1.28771 23.0151 1.68172L12.3484 12.3484C12.1619 12.5372 11.9071 12.643 11.6417 12.6417Z"
        fill="black"
      />
    </Svg>
  );
}

/* ----------------------- Emotion Icons ----------------------- */

function HapppyIcon() {
  return (
    <Image
      source={emotionImages.happy}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function SadIcon() {
  return (
    <Image
      source={emotionImages.sad}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function AngerIcon() {
  return (
    <Image
      source={emotionImages.anger}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function FearIcon() {
  return (
    <Image
      source={emotionImages.fear}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function MixedIcon() {
  return (
    <Image
      source={emotionImages.mixed}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function TouchedIcon() {
  return (
    <Image
      source={emotionImages.touched}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

function ExcitedIcon() {
  return (
    <Image
      source={emotionImages.excited}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );
}

/* ----------------------- ChartModeToggle ----------------------- */

interface ChartModeToggleProps {
  isWeekly: boolean; // true : 주간 / false : 월간
  onChangeMode: (isWeekly: boolean) => void;
}

const ChartModeToggle = ({ isWeekly, onChangeMode }: ChartModeToggleProps) => {
  const { s } = useScale();

  return (
    <View
      style={[
        toggleStyles.toggleContainer,
        {
          width: s(98),
          height: s(36),
          paddingHorizontal: s(2),
          borderRadius: s(32),
        },
      ]}
    >
      {/* 주간 버튼 */}
      <TouchableOpacity
        style={[
          toggleStyles.segment,
          isWeekly && toggleStyles.segmentActive, // 선택됐을 때 스타일
          { width: s(46), height: s(32), borderRadius: s(32) },
        ]}
        onPress={() => onChangeMode(true)}
      >
        <Text
          style={[
            toggleStyles.segmentText,
            isWeekly && toggleStyles.segmentTextActive,
            { fontSize: s(12) },
          ]}
        >
          주간
        </Text>
      </TouchableOpacity>

      {/* 달력 버튼 */}
      <TouchableOpacity
        style={[
          toggleStyles.segment,
          !isWeekly && toggleStyles.segmentActive,
          { width: s(46), height: s(32), borderRadius: s(32) },
        ]}
        onPress={() => onChangeMode(false)}
      >
        <Text
          style={[
            toggleStyles.segmentText,
            !isWeekly && toggleStyles.segmentTextActive,
            { fontSize: s(12) },
          ]}
        >
          달력
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/* ----------------------- ChartTitle ----------------------- */

type Mode = "month" | "week";

interface EmotionSummaryProps {
  mode: Mode; // 'month' | 'week'
  count: number; // 12
  verb: string; // '슬펐'
  color: string; // 감정 컬러 (파랑)
  Icon: React.ComponentType;
}

const ChartTitle = ({
  mode,
  count,
  verb,
  color,
  Icon,
}: EmotionSummaryProps) => {
  const { s } = useScale();
  const prefix = mode === "month" ? "이번 달은" : "이번 주는";

  return (
    <View>
      <Text style={[titleStyles.prefix, { fontSize: s(24) }]}>{prefix}</Text>

      <View style={titleStyles.container}>
        <Text
          style={[
            titleStyles.content,
            { color, marginRight: s(4), fontSize: s(24) },
          ]}
        >
          <Text>{count}번 </Text>
          <Text>{verb}</Text>
          <Text>어요</Text>
        </Text>
        <Icon />
      </View>
    </View>
  );
};

/* ----------------------- DreamKeywordCloud ----------------------- */

interface KeywordCloudProps {
  title: string;
  items: DreamKeywordItem[];
}

// 키워드 클라우드 컴포넌트 (백엔드 연동 버전)
const DreamKeywordCloud = ({ title, items }: KeywordCloudProps) => {
  const { s } = useScale();

  const sortedKeywords = [...items].sort((a, b) => b.count - a.count);
  const maxFreq = Math.max(...sortedKeywords.map((item) => item.count), 1);
  const minFreq = Math.min(...sortedKeywords.map((item) => item.count), 1);

  const getTagFontSize = (freq: number) => {
    const ratio = (freq - minFreq) / (maxFreq - minFreq || 1);
    return s(12 + ratio * 12);
  };

  const getTagOpacity = (freq: number) => {
    const ratio = (freq - minFreq) / (maxFreq - minFreq || 1);
    return 0.6 + ratio * 0.4;
  };

  return (
    <View style={{ width: "100%", paddingHorizontal: s(16), marginTop: s(16) }}>
      <Text
        style={[
          keywordStyles.sectionTitle,
          { marginBottom: s(16), fontSize: s(16) },
        ]}
      >
        {title}
      </Text>

      <View style={keywordStyles.cloudContainer}>
        {sortedKeywords.map((item, index) => (
          <View
            key={`${item.keyword}-${index}`}
            style={[
              keywordStyles.cloudTag,
              {
                opacity: getTagOpacity(item.count),
              },
            ]}
          >
            <Text
              style={[
                keywordStyles.cloudTagText,
                {
                  fontSize: getTagFontSize(item.count),
                },
              ]}
              numberOfLines={1}
            >
              {item.keyword}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/* ----------------------- EmotionBarChart (내장) ----------------------- */

type EmotionMeta = {
  key: EmotionKey;
  label: string;
  color: string;
  Icon: React.ComponentType;
};

interface EmotionBarChartProps {
  emotions: EmotionMeta[];
  data: Record<EmotionKey, number>;
  highlightedKey: EmotionKey | null;
  selectedEmotion: EmotionKey | null;
  onEmotionPress?: (emotionKey: EmotionKey) => void;
}

const EmotionBarChart = ({
  emotions,
  data,
  highlightedKey,
  selectedEmotion,
  onEmotionPress,
}: EmotionBarChartProps) => {
  const { s } = useScale();
  const [activeKey, setActiveKey] = useState<string | null>(null); // 꾹 눌러서 개수 보여줄 대상

  const counts = emotions.map((e) => data[e.key] ?? 0);
  const maxCount = Math.max(...counts, 0);
  const maxBarHeight = s(152); // 바 최대 높이

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: s(42),
        }}
      >
        {emotions.map((emotion) => {
          const count = data[emotion.key] ?? 0;
          const ratio = count / maxCount || 0;
          const barHeight = Math.max(ratio * maxBarHeight, s(4));

          const isHighlighted = emotion.key === highlightedKey;
          const isActive = activeKey === emotion.key;

          const isMax = count === maxCount && maxCount > 0;

          // 최다 동점 감정들 key 모으기
          const maxKeys = emotions
            .map((e) => e.key)
            .filter((key) => (data[key] ?? 0) === maxCount && maxCount > 0);

          const maxTieCount = maxKeys.length;

          // ✅ 동점이면 "선택된 최다"만 숫자 보이기 / 단독 1등이면 자동 표시
          const shouldShowMaxLabel =
            isMax && (maxTieCount === 1 || selectedEmotion === emotion.key);

          // 기본은 회색, highlightedKey만 컬러
          const barColor = isHighlighted ? emotion.color : "#E3E3E3";

          const showTooltip = isActive;

          return (
            <Pressable
              key={emotion.key}
              style={{ alignItems: "center", flex: 1 }}
              onPress={() => {
                if (isMax) onEmotionPress?.(emotion.key);
              }}
              onLongPress={() => {
                if (!isMax) {
                  setActiveKey(emotion.key);
                  setTimeout(() => setActiveKey(null), 700);
                }
              }}
              delayLongPress={300}
            >
              {/* ✅ 최다 숫자(동점이면 선택된 것만) */}
              <View style={{ justifyContent: "flex-end", marginBottom: s(5) }}>
                {shouldShowMaxLabel && (
                  <Text
                    style={[
                      barStyles.countText,
                      { color: emotion.color, fontSize: s(16) },
                    ]}
                  >
                    {count}
                  </Text>
                )}
              </View>

              {showTooltip && (
                <View
                  style={[
                    tooltipStyles.bubble,
                    {
                      bottom: barHeight + s(15),
                      borderRadius: s(14),
                      paddingHorizontal: s(22),
                      paddingTop: s(8),
                      minWidth: s(74),
                    },
                  ]}
                >
                  <Text
                    style={[tooltipStyles.bubbleTitle, { fontSize: s(10) }]}
                  >
                    {emotion.label}
                  </Text>

                  <Text
                    style={[
                      tooltipStyles.bubbleCount,
                      { fontSize: s(12), marginTop: s(2) },
                    ]}
                  >
                    {count}번
                  </Text>

                  {/* 꼬리 */}
                  <View
                    style={[
                      tooltipStyles.tail,
                      { bottom: -s(5), marginLeft: s(18) },
                    ]}
                  />
                </View>
              )}

              <View
                style={[
                  barStyles.barTrack,
                  { width: s(40), height: maxBarHeight },
                ]}
              >
                <View
                  style={[
                    barStyles.barFill,
                    { height: barHeight, backgroundColor: barColor },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          marginHorizontal: s(32),
          height: s(2),
          borderRadius: s(5),
          backgroundColor: "#9B9B9B",
        }}
      />

      {/* 감정 태그 반복 */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: s(42),
          marginTop: s(9),
        }}
      >
        {emotions.map((emotion) => {
          const isHighlighted = emotion.key === highlightedKey;

          return (
            <View key={emotion.key} style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={[
                  barStyles.labelText,
                  {
                    color: isHighlighted ? emotion.color : "#1A1A1A",
                    fontSize: s(12),
                  },
                ]}
              >
                {emotion.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/* --------------------------- Chart 본문 --------------------------- */
// 감정 메타 정보 (라벨, 색, 아이콘 등)
const EMOTIONS: {
  key: EmotionKey;
  label: string;
  color: string;
  verb: string; // 문장 앞부분 (어간)
  Icon: React.ComponentType; // Emotion 아이콘
}[] = [
  {
    key: "happy",
    label: "행복",
    color: "#BB7CFF",
    verb: "행복했",
    Icon: HapppyIcon,
  },
  { key: "sad", label: "슬픔", color: "#448FFF", verb: "슬펐", Icon: SadIcon },
  {
    key: "anger",
    label: "분노",
    color: "#C21D1A",
    verb: "화났",
    Icon: AngerIcon,
  },
  {
    key: "fear",
    label: "공포",
    color: "#87B3EC",
    verb: "무서웠",
    Icon: FearIcon,
  },
  {
    key: "mixed",
    label: "미묘",
    color: "#5ABA45",
    verb: "이상했",
    Icon: MixedIcon,
  },
  {
    key: "touched",
    label: "감동",
    color: "#F3BACA",
    verb: "감동했",
    Icon: TouchedIcon,
  },
  {
    key: "excited",
    label: "신남",
    color: "#FFC640",
    verb: "신났",
    Icon: ExcitedIcon,
  },
];

const Chart = () => {
  const { s } = useScale();
  const ITEM_HEIGHT = 32;

  const { savedRecords } = useDreamRecord();

  const [chartData, setChartData] = useState<Record<EmotionKey, number>>({
    happy: 0,
    sad: 0,
    anger: 0,
    fear: 0,
    mixed: 0,
    touched: 0,
    excited: 0,
  });
  
  const [topKeywords, setTopKeywords] = useState<DreamKeywordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartError, setChartError] = useState("");

  // 백엔드 <-> 프론트 키 매핑
  const moodLabelToEmotionKey: Record<string, EmotionKey> = {
    행복: "happy",
    슬픔: "sad",
    분노: "anger",
    공포: "fear",
    미묘: "mixed",
    감동: "touched",
    신남: "excited",
  };

  // ✅ 2) helpers / MONTH_KEYS는 그 다음
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const toMonthKey = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

  const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const monthKeySet = new Set<string>();
  savedRecords.forEach((r) => {
    const d = safeDate(r.date);
    if (!d) return;
    monthKeySet.add(toMonthKey(d));
  });

  const now = new Date();
  const fallbackMonthKey = toMonthKey(now);

  const MONTH_KEYS = Array.from(monthKeySet).sort().reverse();
  if (MONTH_KEYS.length === 0) MONTH_KEYS.push(fallbackMonthKey);

  const MONTHS = MONTH_KEYS.map((k) => `${Number(k.split("-")[1])}월`);

  // 주간/ 월간 모드 토글 (false - 월간, true - 주간)
  const [isWeekly, setISWeekly] = useState(false);
  // 선택된 감정 상태
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey | null>(
    null,
  );

  // 날짜 선택 휠 - 인덱스
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  // 날짜 선택 휠 - 휠 표시 여부
  const [isMonthWheelVisible, setIsMonthWheelVisible] = useState(false);
  const [isWeekWheelVisible, setIsWeekWheelVisible] = useState(false);

  // 날짜 선택 휠 - 월간/ 주간 스크롤 핸들러
  const onMonthMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);
    index = Math.max(0, Math.min(index, MONTHS.length - 1)); // 범위 클램프
    setSelectedMonthIndex(index);
  };

  const onWeekMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);
    index = Math.max(0, Math.min(index, WEEKS.length - 1));
    setSelectedWeekIndex(index);
  };

  // 해당 주차 기간 렌더링
  const getWeekRange = (
    year: number,
    monthIndex: number,
    weekIndex: number,
  ) => {
    // weekIndex는 1부터 시작 (1주차, 2주차...)
    const firstDay = 1 + (weekIndex - 1) * 7;
    const lastDayInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const startDay = Math.min(firstDay, lastDayInMonth);
    const endDay = Math.min(firstDay + 6, lastDayInMonth);

    return { startDay, endDay };
  };

  // 데이터 있는 달만 휠에 보이게
  const monthKey = MONTH_KEYS[selectedMonthIndex]; // ex) '2025-02'
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const monthIndexForRange = Number(monthStr) - 1; // getWeekRange 에서 사용

  // ✅ 날짜가 속한 "월의 몇 주차"인지 (1~5)
  const getWeekNoInMonth = (d: Date) => Math.ceil(d.getDate() / 7);

  // ✅ 선택된 monthKey 기준으로 "데이터가 있는 주차"만 만들기
  const weekNoSet = new Set<number>();

  savedRecords.forEach((record) => {
    const d = safeDate(record.date);
    if (!d) return;

    // 선택된 월만 필터
    if (d.getFullYear() !== year) return;
    if (d.getMonth() !== monthIndexForRange) return; // monthIndexForRange는 0~11

    weekNoSet.add(getWeekNoInMonth(d)); // 1,2,3...
  });

  // 주차 번호 정렬
  let weekNos = Array.from(weekNoSet).sort((a, b) => a - b);

  // ✅ 만약 그 달에 기록이 아예 없으면 휠이 비니까(UX 깨짐) 1주차라도 넣어둠
  if (weekNos.length === 0) weekNos = [1];

  // 실제 사용할 weekKey 목록 (ex: 2025-02-2)
  const WEEK_KEYS_FOR_MONTH = weekNos.map(
    (weekNo) => `${year}-${pad2(monthIndexForRange + 1)}-${weekNo}`,
  );

  // 휠에 보여줄 주차 라벨
  const WEEKS = weekNos.map((weekNo) => `${weekNo}주차`);

  // 선택된 주차 index가 범위를 넘지 않게 보정
  const safeWeekIndex = Math.min(
    selectedWeekIndex,
    Math.max(WEEKS.length - 1, 0),
  );

  // 실제 사용할 weekKey
  const weekKey = WEEK_KEYS_FOR_MONTH[safeWeekIndex];

  // 현재 선택된 월간/주간 문자열
  const selectedMonth = MONTHS[selectedMonthIndex];
  const selectedWeek = WEEKS[safeWeekIndex];

  // baseDate 계산 함수 (월간/ 주간 선택값 기준으로 서버에 보낼 날짜 생성)
  const selectedBaseDate = useMemo(() => {
    if (!isWeekly) {
      const [yearStr, monthStr] = monthKey.split("-");
      const yearNum = Number(yearStr);
      const monthNum = Number(monthStr); // 1~12
  
      const lastDay = new Date(yearNum, monthNum, 0); // 해당 월 마지막 날
      const yyyy = lastDay.getFullYear();
      const mm = String(lastDay.getMonth() + 1).padStart(2, "0");
      const dd = String(lastDay.getDate()).padStart(2, "0");
  
      return `${yyyy}-${mm}-${dd}`;
    }
  
    const [yearStr, monthStr, weekNoStr] = weekKey.split("-");
    const yearNum = Number(yearStr);
    const monthNum = Number(monthStr) - 1;
    const weekNoNum = Number(weekNoStr);
  
    const startDay = 1 + (weekNoNum - 1) * 7;
    const endDate = new Date(yearNum, monthNum, startDay + 6);
  
    const yyyy = endDate.getFullYear();
    const mm = String(endDate.getMonth() + 1).padStart(2, "0");
    const dd = String(endDate.getDate()).padStart(2, "0");
  
    return `${yyyy}-${mm}-${dd}`;
  }, [isWeekly, monthKey, weekKey]);

  // API 호출 
  const fetchChartData = async () => {
    try {
      setLoading(true);
      setChartError("");
  
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) {
        setChartError("userId가 없습니다.");
        return;
      }
  
      const userId = Number(userIdStr);

      // 토큰 붙임
      const token = await AsyncStorage.getItem("accessToken");
      console.log("[Chart] accessToken:", token ? "있음" : "없음");

  
      const rangeType = isWeekly ? "WEEKLY" : "MONTHLY";
      const chartUrl = `${API_BASE_URL}/api/chart/dream-chart?userId=${userId}&rangeType=${rangeType}&baseDate=${selectedBaseDate}`;
  
      const res = await fetch(
        chartUrl,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data: DreamChartResponse = await res.json();

      console.log("[Chart] response data:", data);
      console.log("[Chart] moodDistribution:", data?.moodDistribution);
      console.log("[Chart] topKeywords:", data?.topKeywords);

      const moodDistribution = data?.moodDistribution ?? {};
      const nextEmotionData: Record<EmotionKey, number> = {
        happy: 0,
        sad: 0,
        anger: 0,
        fear: 0,
        mixed: 0,
        touched: 0,
        excited: 0,
      };
  
      Object.entries(moodDistribution).forEach(([label, count]) => {
        const emotionKey = moodLabelToEmotionKey[label];
        if (emotionKey) {
          nextEmotionData[emotionKey] = Number(count);
        }
      });
  
      setChartData(nextEmotionData);
      setTopKeywords(data?.topKeywords ?? []);
    } catch (error) {
      console.error("차트 조회 실패:", error);
      setChartError("차트 데이터를 불러오지 못했습니다.");
      setChartData({
        happy: 0,
        sad: 0,
        anger: 0,
        fear: 0,
        mixed: 0,
        touched: 0,
        excited: 0,
      });
      setTopKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [isWeekly, selectedMonthIndex, safeWeekIndex]);

  // 해당 주차 기간 계산 (현재 주차 번호 사용)
  const weekNo = Number(weekKey.split("-")[2]);
  const { startDay, endDay } = getWeekRange(year, monthIndexForRange, weekNo);

  // 감정 기본값(없을 때 0으로 채우기용)
  const emptyEmotionData: Record<EmotionKey, number> = {
    happy: 0,
    sad: 0,
    anger: 0,
    fear: 0,
    mixed: 0,
    touched: 0,
    excited: 0,
  };

  const moodToEmotion: Record<string, EmotionKey> = {
    "1": "happy",
    "2": "sad",
    "3": "anger",
    "4": "excited",
    "5": "touched",
    "6": "fear",
    "7": "mixed",
  };

  const currentEmotionData = chartData;

  // 최다 감정 계산
  const values = EMOTIONS.map((e) => currentEmotionData[e.key]);
  const maxValue = Math.max(...values, 0);

  const maxEmotion =
    EMOTIONS.find((e) => currentEmotionData[e.key] === maxValue) ?? EMOTIONS[0];

  // 표시할 감정: 선택된 것 또는 최다 감정
  const displayEmotion = selectedEmotion
    ? (EMOTIONS.find((e) => e.key === selectedEmotion) ?? maxEmotion)
    : maxEmotion;

  const displayValue = selectedEmotion
    ? currentEmotionData[selectedEmotion]
    : maxValue;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ paddingLeft: s(16), paddingTop: s(16) }}>
        <Text style={[styles.header_text, { fontSize: s(18) }]}>
          MY 꿈 상태 차트
        </Text>
      </View>

      {/* 선택된 날짜 표시 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: s(20),
          paddingHorizontal: s(16),
        }}
      >
        {isWeekly ? (
          <View>
            {/* 주간 모드 */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.date_text, { fontSize: s(28) }]}>
                {year}년 {selectedMonth}{" "}
              </Text>
              <Text style={[styles.date_text, { fontSize: s(28) }]}>
                {selectedWeek}
              </Text>
              <View style={{ width: s(8) }} />
              <TouchableOpacity
                onPress={() => setIsWeekWheelVisible((prev) => !prev)}
              >
                {isWeekWheelVisible ? <Up_Arrow /> : <Under_Arrow />}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: s(14),
                color: "#9B9B9B",
                fontFamily: "Roboto",
                fontWeight: "400",
              }}
            >
              {selectedMonth.replace("월", "")}.{startDay} ~ {endDay}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* 월간 모드 */}
            <Text style={[styles.date_text, { fontSize: s(28) }]}>
              {year}년{" "}
            </Text>
            <Text style={[styles.date_text, { fontSize: s(28) }]}>
              {selectedMonth}
            </Text>
            <View style={{ width: s(8) }} />
            <TouchableOpacity
              onPress={() => setIsMonthWheelVisible((prev) => !prev)}
            >
              {isMonthWheelVisible ? <Up_Arrow /> : <Under_Arrow />}
            </TouchableOpacity>
          </View>
        )}
        <View style={{ zIndex: 10 }}>
          <ChartModeToggle
            isWeekly={isWeekly}
            onChangeMode={(next) => {
              setISWeekly(next);
              // 모드 바꿀 때 휠들 정리
              setIsMonthWheelVisible(false);
              setIsWeekWheelVisible(false);
            }}
          />
        </View>
      </View>

      {/* 주간 - 날짜 선택 휠 */}
      {isWeekWheelVisible && (
        <View
          style={[
            styles.wheel_card,
            {
              width: s(136),
              height: ITEM_HEIGHT * 5,
              borderRadius: s(16),
              marginLeft: s(144),
              marginTop: s(-8),
            },
          ]}
        >
          <View style={{ flex: 1, borderRadius: s(16), overflow: "hidden" }}>
            <FlatList
              data={WEEKS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={onWeekMomentumEnd}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              contentContainerStyle={{
                paddingVertical: ITEM_HEIGHT * 2,
              }}
              renderItem={({ item, index }) => {
                const diff = Math.abs(index - selectedWeekIndex);

                let fontSize = s(16);
                let opacity = 0.1;

                if (diff === 0) {
                  fontSize = s(16);
                  opacity = 1;
                } else if (diff === 1) {
                  fontSize = s(16);
                  opacity = 0.4;
                }

                return (
                  <View
                    style={{
                      height: ITEM_HEIGHT,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize, fontWeight: "700", opacity }}>
                      {selectedMonth} {item}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* 월간 - 날짜 선택 휠 */}
      {isMonthWheelVisible && (
        <View
          style={[
            styles.wheel_card,
            {
              width: s(136),
              height: ITEM_HEIGHT * 5,
              borderRadius: s(16),
              marginLeft: s(72),
              marginTop: s(8),
            },
          ]}
        >
          <View style={{ flex: 1, borderRadius: s(16), overflow: "hidden" }}>
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={onMonthMomentumEnd}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              contentContainerStyle={{
                paddingVertical: ITEM_HEIGHT * 2,
              }}
              renderItem={({ item, index }) => {
                const diff = Math.abs(index - selectedMonthIndex);

                let fontSize = s(16);
                let opacity = 0.15;

                if (diff === 0) {
                  fontSize = s(16);
                  opacity = 1;
                } else if (diff === 1) {
                  fontSize = s(16);
                  opacity = 0.4;
                }

                return (
                  <View
                    style={{
                      height: ITEM_HEIGHT,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize, fontWeight: "700", opacity }}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* 상단 타이틀 */}
      <View
        style={{
          position: "absolute",
          paddingHorizontal: s(16),
          marginTop: s(183),
        }}
      >
        {displayValue > 0 && (
          <ChartTitle
            mode={isWeekly ? "week" : "month"}
            count={displayValue}
            verb={displayEmotion.verb}
            color={displayEmotion.color}
            Icon={displayEmotion.Icon}
          />
        )}
      </View>

      {/* 감정 바 차트 + 키워드 */}
      <View style={{ position: "absolute", width: "100%", marginTop: s(282) }}>
        <EmotionBarChart
          emotions={EMOTIONS}
          data={currentEmotionData}
          highlightedKey={
            selectedEmotion || (maxValue > 0 ? maxEmotion.key : null)
          }
          selectedEmotion={selectedEmotion}
          onEmotionPress={(emotionKey) => {
            setSelectedEmotion(
              emotionKey === selectedEmotion ? null : emotionKey,
            );
          }}
        />

        <View
          style={{
            width: "100%",
            height: s(8),
            backgroundColor: "#EEE",
            marginTop: s(32),
          }}
        />

        {/* 꿈 키워드 TOP3 */}
        <DreamKeywordCloud
          title={
            isWeekly
              ? "이번 주 가장 많이 나온 꿈 키워드 TOP3"
              : "이번 달 가장 많이 나온 꿈 키워드 TOP3"
          }
          items={topKeywords}
        />
      </View> 

      <View
        style={[
          styles.footer,
          {
            height: s(72),
            position: "absolute",
            left: s(0),
            right: s(0),
            bottom: s(8),
          },
        ]}
      />
    </SafeAreaView>
  );
};

export default Chart;

/* -------------------------- styles들 -------------------------- */

const styles = StyleSheet.create({
  header_text: {
    fontFamily: "Roboto",
    fontWeight: "700",
  },
  date_text: {
    fontFamily: "Roboto",
    fontWeight: "700",
  },
  wheel_card: {
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  footer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

const toggleStyles = StyleSheet.create({
  // 바깥 둥근 배경
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EFF0F4", // 연한 회색 배경
    justifyContent: "center",
    alignItems: "center",
  },
  // 각 세그먼트(버튼)
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // 선택된 세그먼트 배경
  segmentActive: {
    backgroundColor: "#FFFFFF",
  },
  // 기본 텍스트
  segmentText: {
    fontWeight: "400",
    color: "#6B7280", // 회색
  },
  // 선택된 텍스트
  segmentTextActive: {
    fontWeight: "700",
    color: "#111827", // 진한 검정
  },
});

const titleStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  prefix: {
    fontFamily: "Roboto",
    color: "#000",
    fontWeight: "700",
  },
  content: {
    fontFamily: "Roboto",
    fontWeight: "700",
  },
});

const keywordStyles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "700",
    color: "#313131",
    fontFamily: "Roboto",
  },
  dreamTitle: {
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "Roboto",
  },
  interpretation: {
    fontWeight: "400",
    color: "#A3A3A3",
    fontFamily: "Roboto",
  },
  cloudContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-start",
  },
  cloudTag: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  cloudTagText: {
    fontWeight: "600",
    color: "#BB7CFF",
    fontFamily: "Roboto",
  },
});

const barStyles = StyleSheet.create({
  barTrack: {
    zIndex: 998,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  countText: {
    fontWeight: "700",
    color: "#E3E3E3",
    textAlign: "center",
  },
  labelText: {
    fontWeight: "700",
    textAlign: "center",
  },
});

const tooltipStyles = StyleSheet.create({
  bubble: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 999,

    // ✅ 스샷 같은 “둥근 흰 박스 + 그림자”
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10, // 안드로이드 그림자
  },

  bubbleTitle: {
    fontWeight: "800",
    color: "#5F5F5F",
    lineHeight: 12,
  },

  bubbleCount: {
    fontWeight: "800",
    color: "#000",
    lineHeight: 15,
  },

  // ✅ 아래 꼬리 (회전된 사각형으로 만들면 “부드럽게” 나옴)
  tail: {
    width: 8,
    height: 9,
    backgroundColor: "#FFFFFF",
    transform: [{ translateX: -7 }, { rotate: "45deg" }],

    // 꼬리도 같이 그림자 (자연스럽게)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
});
