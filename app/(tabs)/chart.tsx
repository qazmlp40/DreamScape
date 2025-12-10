import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

/* ----------------------- Types ----------------------- */
type EmotionKey = 'happy' | 'sad' | 'anger' | 'fear' | 'mixed' | 'touched' | 'excited';

interface DreamKeywordItem {
  dreamSummary: string;
  interpretation: string;
}

/* ----------------------- Mock Data ----------------------- */
const MOCK_MONTHLY_DATA: Record<string, Record<EmotionKey, number>> = {
  '2025-02': { happy: 5, sad: 3, anger: 2, fear: 1, mixed: 4, touched: 2, excited: 3 },
  '2025-03': { happy: 8, sad: 2, anger: 1, fear: 3, mixed: 2, touched: 5, excited: 4 },
};

const MOCK_WEEKLY_DATA: Record<string, Record<EmotionKey, number>> = {
  '2025-02-1': { happy: 2, sad: 1, anger: 0, fear: 1, mixed: 1, touched: 0, excited: 1 },
  '2025-02-2': { happy: 1, sad: 2, anger: 1, fear: 0, mixed: 2, touched: 1, excited: 0 },
  '2025-03-1': { happy: 3, sad: 0, anger: 0, fear: 1, mixed: 0, touched: 2, excited: 1 },
};

const MOCK_MONTHLY_KEYWORDS: Record<string, DreamKeywordItem[]> = {
  '2025-02': [
    { dreamSummary: '하늘을 나는 꿈', interpretation: '자유와 해방을 의미합니다.' },
    { dreamSummary: '물에 빠지는 꿈', interpretation: '감정적 어려움을 나타냅니다.' },
    { dreamSummary: '시험 보는 꿈', interpretation: '불안과 압박감을 의미합니다.' },
  ],
  '2025-03': [
    { dreamSummary: '돈을 줍는 꿈', interpretation: '행운과 기회를 의미합니다.' },
    { dreamSummary: '길을 잃는 꿈', interpretation: '방향성 상실을 나타냅니다.' },
    { dreamSummary: '친구를 만나는 꿈', interpretation: '관계 회복을 의미합니다.' },
  ],
};

const MOCK_WEEKLY_KEYWORDS: Record<string, DreamKeywordItem[]> = {
  '2025-02-1': [
    { dreamSummary: '하늘을 나는 꿈', interpretation: '자유와 해방을 의미합니다.' },
  ],
  '2025-02-2': [
    { dreamSummary: '물에 빠지는 꿈', interpretation: '감정적 어려움을 나타냅니다.' },
  ],
  '2025-03-1': [
    { dreamSummary: '돈을 줍는 꿈', interpretation: '행운과 기회를 의미합니다.' },
  ],
};

// 감정 이모지 PNG 파일들
const emotionImages = {
  happy: require('../../assets/images/happy_icon.png'),
  sad: require('../../assets/images/Sad_icon.png'),
  anger: require('../../assets/images/anger_icon.png'),
  fear: require('../../assets/images/Scared_icon.png'),
  mixed: require('../../assets/images/Ambiguous_icon.png'),
  touched: require('../../assets/images/Impressed_icon.png'),
  excited: require('../../assets/images/Excitement_icon.png'),
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
    <Svg
      width={s(W)}
      height={s(H)}
      viewBox="0 0 24 13"
      fill="none"
    >
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
    <Svg
      width={s(W)}
      height={s(H)}
      viewBox="0 0 24 13"
      fill="none"
    >
      <Path
        d="M11.6417 12.6417C11.3763 12.643 11.1216 12.5372 10.9351 12.3484L0.26839 1.68172C-0.0987553 1.28771 -0.087922 0.67371 0.292894 0.292894C0.67371 -0.087922 1.28771 -0.0987553 1.68172 0.26839L11.6417 10.2284L21.6017 0.26839C21.9957 -0.0987553 22.6097 -0.087922 22.9906 0.292894C23.3714 0.67371 23.3822 1.28771 23.0151 1.68172L12.3484 12.3484C12.1619 12.5372 11.9071 12.643 11.6417 12.6417Z"
        fill="black"
      />
    </Svg>
  );
}

/* ----------------------- Emotion Icons ----------------------- */

function HapppyIcon() {
  return <Image source={emotionImages.happy} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function SadIcon() {
  return <Image source={emotionImages.sad} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function AngerIcon() {
  return <Image source={emotionImages.anger} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function FearIcon() {
  return <Image source={emotionImages.fear} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function MixedIcon() {
  return <Image source={emotionImages.mixed} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function TouchedIcon() {
  return <Image source={emotionImages.touched} style={{ width: 24, height: 24 }} resizeMode="contain" />;
}

function ExcitedIcon() {
  return <Image source={emotionImages.excited} style={{ width: 24, height: 24 }} resizeMode="contain" />;
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
        { width: s(98), height: s(36), paddingHorizontal: s(2), borderRadius: s(32) },
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

type Mode = 'month' | 'week';

interface EmotionSummaryProps {
  mode: Mode; // 'month' | 'week'
  count: number; // 12
  verb: string; // '슬펐'
  color: string; // 감정 컬러 (파랑)
  Icon: React.ComponentType;
}

const ChartTitle = ({ mode, count, verb, color, Icon }: EmotionSummaryProps) => {
  const { s } = useScale();
  const prefix = mode === 'month' ? '이번 달은' : '이번 주는';

  return (
    <View>
      <Text style={[titleStyles.prefix, { fontSize: s(24) }]}>{prefix}</Text>

      <View style={titleStyles.container}>
        <Text style={[titleStyles.content, { color, marginRight: s(4), fontSize: s(24) }]}>
          <Text>{count}번 </Text>
          <Text>{verb}</Text>
          <Text>어요</Text>
        </Text>
        <Icon />
      </View>
    </View>
  );
};

/* ----------------------- DreamKeywordTop3 ----------------------- */

interface KeywordTop3Props {
  title: string; // "이번 달..." / "이번 주..." 같은 타이틀
  items: DreamKeywordItem[]; // 이미 정렬된 TOP3 리스트
}

const DreamKeywordTop3 = ({ title, items }: KeywordTop3Props) => {
  const { s } = useScale();

  const top3 = items.slice(0, 3); // 혹시 3개 이상 들어와도 상위 3개만

  return (
    <View style={{ width: '100%', paddingHorizontal: s(16), marginTop: s(16) }}>
      <Text style={[keywordStyles.sectionTitle, { marginBottom: s(16), fontSize: s(16) }]}>
        {title}
      </Text>

      {top3.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: s(12) }}>
          {/* 회색 박스 */}
          <View
            style={{
              width: s(64),
              height: s(64),
              backgroundColor: '#D9D9D9',
              marginRight: s(16),
            }}
          />

          {/* 텍스트 영역 */}
          <View style={{ flex: 1 }}>
            {/* 상단: 꿈 내용 요약 */}
            <Text
              style={[keywordStyles.dreamTitle, { marginBottom: s(8), fontSize: s(18) }]}
              numberOfLines={1}
            >
              {item.dreamSummary}
            </Text>

            {/* 하단: 해몽 내용 */}
            <Text
              style={[keywordStyles.interpretation, { fontSize: s(12) }]}
              numberOfLines={2}
            >
              {item.interpretation}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

/* ----------------------- EmotionBarChart (내장) ----------------------- */

type EmotionMeta = {
  key: string; // 'happy' 같은 키
  label: string; // '행복'
  color: string; // 메인 색
  Icon: React.ComponentType; // 아이콘 컴포넌트
};

interface EmotionBarChartProps {
  emotions: EmotionMeta[]; // EMOTIONS 배열 그대로
  data: Record<string, number>; // currentEmotionData 그대로
  highlightedKey: string | null; // 최다 감정 key (없으면 null)
}

const EmotionBarChart = ({ emotions, data, highlightedKey }: EmotionBarChartProps) => {
  const { s } = useScale();
  const [activeKey, setActiveKey] = useState<string | null>(null); // 꾹 눌러서 개수 보여줄 대상

  const counts = emotions.map((e) => data[e.key] ?? 0);
  const maxCount = Math.max(...counts, 0);
  const maxBarHeight = s(152); // 바 최대 높이

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: s(42),
        }}
      >
        {emotions.map((emotion) => {
          const count = data[emotion.key] ?? 0;
          const ratio = count / maxCount || 0;
          const barHeight = Math.max(ratio * maxBarHeight, s(4)); // 0이어도 살짝 보이게

          const isHighlighted = emotion.key === highlightedKey;
          const isActive = activeKey === emotion.key;

          // 기본은 회색, 최다 감정만 컬러
          const barColor = isHighlighted ? emotion.color : '#E3E3E3';

          // 숫자 보여줄 조건: 최다 감정 OR 사용자가 꾹 눌러서 선택한 감정
          const isMax = emotion.key === highlightedKey;
          const showCountLabel = isMax || isActive;

          return (
            <Pressable
              key={emotion.key}
              style={{ alignItems: 'center', flex: 1 }}
              onLongPress={() => {
                // 🔹 최다 감정(highlightedKey)은 이미 항상 표시되므로 LongPress 동작 제외
                if (!isMax) {
                  setActiveKey(emotion.key); // 해당 감정의 개수 표시 활성화
                  setTimeout(() => setActiveKey(null), 700); // 0.7초 뒤 자동 숨김
                }
              }}
              delayLongPress={300}
            >
              {/* 개수 텍스트 (최다 감정 상단 고정) */}
              <View style={{ justifyContent: 'flex-end', marginBottom: s(5) }}>
                {isMax && (
                  <Text
                    style={[
                      barStyles.countText,
                      { color: isHighlighted ? emotion.color : '#E3E3E3', fontSize: s(16) },
                    ]}
                  >
                    {count}
                  </Text>
                )}
              </View>

              {/* 개수 텍스트: 바 높이에 맞춰 위에 붙이기 */}
              {showCountLabel && (
                <Text
                  style={[
                    barStyles.countText,
                    {
                      position: 'absolute',
                      bottom: barHeight + s(5), // 바 위에서 살짝 떨어져서
                      color: isHighlighted ? emotion.color : '#E3E3E3',
                      fontSize: s(16),
                    },
                  ]}
                >
                  {count}
                </Text>
              )}

              {/* 바 전체 트랙 */}
              <View style={[barStyles.barTrack, { width: s(40), height: maxBarHeight }]}>
                <View
                  style={[
                    barStyles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
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
          backgroundColor: '#9B9B9B',
        }}
      />

      {/* 감정 태그 반복 */}
      <View style={{ flexDirection: 'row', paddingHorizontal: s(42), marginTop: s(9) }}>
        {emotions.map((emotion) => {
          const isHighlighted = emotion.key === highlightedKey;

          return (
            <View key={emotion.key} style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={[
                  barStyles.labelText,
                  { color: isHighlighted ? emotion.color : '#1A1A1A', fontSize: s(12) },
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

// 날짜 휠 데이터 - 12월로 통일
const MONTH_KEYS = ['2025-12']; // 12월 데이터만

// 2) 휠에 보여줄 라벨
const MONTHS = ['12월']; // 12월만

// 감정 메타 정보 (라벨, 색, 아이콘 등)
const EMOTIONS: {
  key: EmotionKey;
  label: string;
  color: string;
  verb: string; // 문장 앞부분 (어간)
  Icon: React.ComponentType; // Emotion 아이콘
}[] = [
  { key: 'happy', label: '행복', color: '#BB7CFF', verb: '행복했', Icon: HapppyIcon },
  { key: 'sad', label: '슬픔', color: '#448FFF', verb: '슬펐', Icon: SadIcon },
  { key: 'anger', label: '분노', color: '#C21D1A', verb: '화났', Icon: AngerIcon },
  { key: 'fear', label: '공포', color: '#87B3EC', verb: '무서웠', Icon: FearIcon },
  { key: 'mixed', label: '미묘', color: '#5ABA45', verb: '이상했', Icon: MixedIcon },
  { key: 'touched', label: '감동', color: '#F3BACA', verb: '감동했', Icon: TouchedIcon },
  { key: 'excited', label: '신남', color: '#FFC640', verb: '신났', Icon: ExcitedIcon },
];

const Chart = () => {
  const { s } = useScale();
  const ITEM_HEIGHT = 32;

  // 주간/ 월간 모드 토글 (false - 월간, true - 주간)
  const [isWeekly, setISWeekly] = useState(false);

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
  const getWeekRange = (year: number, monthIndex: number, weekIndex: number) => {
    // 1주차 = 1~7, 2주차 = 8~14, 3주차 = 15~21, 4주차 = 22~28, 5주차 = 29~말일
    const firstDay = 1 + weekIndex * 7;
    const lastDayInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const startDay = Math.min(firstDay, lastDayInMonth);
    const endDay = Math.min(firstDay + 6, lastDayInMonth);

    return { startDay, endDay };
  };

  // 데이터 있는 달만 휠에 보이게
  const monthKey = MONTH_KEYS[selectedMonthIndex]; // ex) '2025-02'
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const monthIndexForRange = Number(monthStr) - 1; // getWeekRange 에서 사용

  // 현재 선택된 달에 해당하는 주차 key들만 추출
  const WEEK_KEYS_FOR_MONTH = ['2025-12-1']; // 12월 1주차만

  // 휠에 보여줄 주차 라벨
  const WEEKS = WEEK_KEYS_FOR_MONTH.map((key) => {
    const parts = key.split('-'); // ['2025','07','1']
    const weekNo = Number(parts[2]); // 1
    return `${weekNo}주차`; // '1주차'
  });

  // 선택된 주차 index가 범위를 넘지 않게 보정
  const safeWeekIndex = Math.min(selectedWeekIndex, Math.max(WEEKS.length - 1, 0));

  // 실제 사용할 weekKey
  const weekKey = WEEK_KEYS_FOR_MONTH[safeWeekIndex];

  // 현재 선택된 월간/주간 문자열
  const selectedMonth = MONTHS[selectedMonthIndex];
  const selectedWeek = WEEKS[safeWeekIndex];

  // 해당 주차 기간 계산
  const { startDay, endDay } = getWeekRange(year, monthIndexForRange, selectedWeekIndex);

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

  // 월간/주간 데이터 중 현재 선택된 기간에 해당하는 것만 가져오기
  const monthlyRaw = MOCK_MONTHLY_DATA[monthKey] ?? {};
  const weeklyRaw = MOCK_WEEKLY_DATA[weekKey] ?? {};

  const currentEmotionData: Record<EmotionKey, number> = isWeekly
    ? { ...emptyEmotionData, ...weeklyRaw }
    : { ...emptyEmotionData, ...monthlyRaw };

  // 최다 감정 계산
  const values = EMOTIONS.map((e) => currentEmotionData[e.key]);
  const maxValue = Math.max(...values, 0);

  const maxEmotion = EMOTIONS.find((e) => currentEmotionData[e.key] === maxValue) ?? EMOTIONS[0];

  // 꿈 키워드 데이터
  const monthlyItems = MOCK_MONTHLY_KEYWORDS[monthKey] ?? [];
  const weeklyItems = MOCK_WEEKLY_KEYWORDS[weekKey] ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingLeft: s(16), paddingTop: s(16) }}>
        <Text style={[styles.header_text, { fontSize: s(18) }]}>MY 꿈 상태 차트</Text>
      </View>

      {/* 선택된 날짜 표시 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: s(20),
          paddingHorizontal: s(16),
        }}
      >
        {isWeekly ? (
          <View>
            {/* 주간 모드 */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.date_text, { fontSize: s(28) }]}>2025년 {selectedMonth} </Text>
              <Text style={[styles.date_text, { fontSize: s(28) }]}>{selectedWeek}</Text>
              <View style={{ width: s(8) }} />
              <TouchableOpacity onPress={() => setIsWeekWheelVisible((prev) => !prev)}>
                {isWeekWheelVisible ? <Up_Arrow /> : <Under_Arrow />}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: s(14),
                color: '#9B9B9B',
                fontFamily: 'Roboto',
                fontWeight: '400',
              }}
            >
              {selectedMonth.replace('월', '')}.{startDay} ~ {endDay}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* 월간 모드 */}
            <Text style={[styles.date_text, { fontSize: s(28) }]}>2025년 </Text>
            <Text style={[styles.date_text, { fontSize: s(28) }]}>{selectedMonth}</Text>
            <View style={{ width: s(8) }} />
            <TouchableOpacity onPress={() => setIsMonthWheelVisible((prev) => !prev)}>
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
          <View style={{ flex: 1, borderRadius: s(16), overflow: 'hidden' }}>
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
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize, fontWeight: '700', opacity }}>
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
          <View style={{ flex: 1, borderRadius: s(16), overflow: 'hidden' }}>
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
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize, fontWeight: '700', opacity }}>{item}</Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* 상단 타이틀 */}
      <View style={{ position: 'absolute', paddingHorizontal: s(16), marginTop: s(183) }}>
        {maxValue > 0 && (
          <ChartTitle
            mode={isWeekly ? 'week' : 'month'}
            count={maxValue}
            verb={maxEmotion.verb}
            color={maxEmotion.color}
            Icon={maxEmotion.Icon}
          />
        )}
      </View>

      {/* 감정 바 차트 + 키워드 */}
      <View style={{ position: 'absolute', width: '100%', marginTop: s(282) }}>
        <EmotionBarChart
          emotions={EMOTIONS}
          data={currentEmotionData}
          highlightedKey={maxValue > 0 ? maxEmotion.key : null}
        />

        <View style={{ width: '100%', height: s(8), backgroundColor: '#EEE', marginTop: s(32) }} />

        {/* 꿈 키워드 TOP3 */}
        <DreamKeywordTop3
          title={
            isWeekly
              ? '이번 주 가장 많이 나온 꿈 키워드 TOP3'
              : '이번 달 가장 많이 나온 꿈 키워드 TOP3'
          }
          items={isWeekly ? weeklyItems : monthlyItems}
        />
      </View>

      <View
        style={[
          styles.footer,
          { height: s(72), position: 'absolute', left: s(0), right: s(0), bottom: s(8) },
        ]}
      />
    </SafeAreaView>
  );
};

export default Chart;

/* -------------------------- styles들 -------------------------- */

const styles = StyleSheet.create({
  header_text: {
    fontFamily: 'Roboto',
    fontWeight: '700',
  },
  date_text: {
    fontFamily: 'Roboto',
    fontWeight: '700',
  },
  wheel_card: {
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  footer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const toggleStyles = StyleSheet.create({
  // 바깥 둥근 배경
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF0F4', // 연한 회색 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 각 세그먼트(버튼)
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 선택된 세그먼트 배경
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  // 기본 텍스트
  segmentText: {
    fontWeight: '400',
    color: '#6B7280', // 회색
  },
  // 선택된 텍스트
  segmentTextActive: {
    fontWeight: '700',
    color: '#111827', // 진한 검정
  },
});

const titleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  prefix: {
    fontFamily: 'Roboto',
    color: '#000',
    fontWeight: '700',
  },
  content: {
    fontFamily: 'Roboto',
    fontWeight: '700',
  },
});

const keywordStyles = StyleSheet.create({
  sectionTitle: {
    fontWeight: '700',
    color: '#313131',
    fontFamily: 'Roboto',
  },
  dreamTitle: {
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Roboto',
  },
  interpretation: {
    fontWeight: '400',
    color: '#A3A3A3',
    fontFamily: 'Roboto',
  },
});

const barStyles = StyleSheet.create({
  barTrack: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  countText: {
    fontWeight: '700',
    color: '#E3E3E3',
    textAlign: 'center',
  },
  labelText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});