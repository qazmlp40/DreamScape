import { StyleSheet, Text, View, TouchableOpacity, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useScale from '../../hooks/useScale';
import Under_Arrow from '../../images/Chart_icons/under_arrow';
import Up_Arrow from '../../images/Chart_icons/up_arrow';
import ChartModeToggle from '../../components/Chart/ChartModeToggle';
import ChartTitle from '../../components/Chart/ChartTitle';
import HapppyIcon from '../../images/Chart_icons/happyIcon';
import SadIcon from '../../images/Chart_icons/sadIcon';
import AngerIcon from '../../images/Chart_icons/angericon';
import FearIcon from '../../images/Chart_icons/fearIcon';
import MixedIcon from '../../images/Chart_icons/mixedIcon';
import TouchedIcon from '../../images/Chart_icons/touchedIcon';
import ExcitedIcon from '../../images/Chart_icons/excitedIcon';
import EmotionBarChart from '../../components/Chart/EmotionBarChart';
import { EmotionKey } from '../../components/Chart_data/emotiontypes';
import { DreamKeywordItem } from '../../components/Chart_data/dreamType';
import { MOCK_WEEKLY_DATA } from '../../components/Chart_data/emotionWeeklyData';
import { MOCK_MONTHLY_DATA } from '../../components/Chart_data/emotionMonthlyData';
import { MOCK_WEEKLY_KEYWORDS } from '../../components/Chart_data/dreamWeeklyKeywords';
import { MOCK_MONTHLY_KEYWORDS } from '../../components/Chart_data/dreamMonthlyKeywords';
import DreamKeywordTop3 from '../../components/Chart/DreamKeywordTop3';


// 날짜 휠 데이터
// 1) 데이터가 있는 '2025-02', '2025-03' ... 키 목록
const MONTH_KEYS = Object.keys(MOCK_MONTHLY_KEYWORDS)  // ['2025-02', '2025-03', ...]
  .sort(); // 정렬

// 2) 휠에 보여줄 라벨
const MONTHS = MONTH_KEYS.map(key => {
  const [, monthStr] = key.split('-');  // '02'
  return `${Number(monthStr)}월`;       // '2월'
});


// 감정 메타 정보 (라벨, 색, 아이콘 등)
const EMOTIONS: {
  key: EmotionKey;
  label: string;
  color: string;     
  verb: string;   // 문장 앞부분 (어간)
  Icon: React.ComponentType; // Emotion 아이콘
}[] = [
  { key: 'happy', label: '행복', color: '#BB7CFF',verb: '행복했', Icon: HapppyIcon },
  { key: 'sad', label: '슬픔', color: '#448FFF', verb: '슬펐', Icon: SadIcon},
  { key: 'anger', label: '분노', color: '#C21D1A', verb: '화났', Icon: AngerIcon},
  { key: 'fear', label: '공포', color: '#87B3EC', verb: '무서웠', Icon: FearIcon},
  { key: 'mixed', label: '미묘', color: '#5ABA45', verb: '이상했', Icon: MixedIcon},
  { key: 'touched', label: '감동', color: '#F3BACA', verb: '감동했', Icon: TouchedIcon},
  { key: 'excited', label: '신남', color: '#FFC640', verb: '신났', Icon: ExcitedIcon},
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

    // 현재 선택된 달에 해당하는 주차 key들만 추출 (데이터 있는 주차만 휠에 보이게)
    const WEEK_KEYS_FOR_MONTH = Object.keys(MOCK_WEEKLY_KEYWORDS) // ['2025-07-1', ...]
    .filter(key => key.startsWith(`${monthKey}-`))              // 예: monthKey = '2025-07'
    .sort();

    // 휠에 보여줄 주차 라벨
    const WEEKS = WEEK_KEYS_FOR_MONTH.map(key => {
    const parts = key.split('-');         // ['2025','07','1']
    const weekNo = Number(parts[2]);      // 1
    return `${weekNo}주차`;               // '1주차'
    });

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
    const weeklyRaw  = MOCK_WEEKLY_DATA[weekKey] ?? {};
  
    const currentEmotionData: Record<EmotionKey, number> = isWeekly
      ? { ...emptyEmotionData, ...weeklyRaw }
      : { ...emptyEmotionData, ...monthlyRaw };
  
    // 최다 감정 계산
    const values   = EMOTIONS.map(e => currentEmotionData[e.key]);
    const maxValue = Math.max(...values, 0);
  
    const maxEmotion = EMOTIONS.find(e => currentEmotionData[e.key] === maxValue) ?? EMOTIONS[0];  

    // 꿈 키워드 데이터
    const monthlyItems = MOCK_MONTHLY_KEYWORDS[monthKey] ?? [];
    const weeklyItems  = MOCK_WEEKLY_KEYWORDS[weekKey] ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingLeft: s(16), paddingTop: s(16) }}>
        <Text style={[styles.header_text, {fontSize: s(18)}]}>MY 꿈 상태 차트</Text>
      </View>

      {/* 선택된 날짜 표시 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: s(20), paddingHorizontal: s(16) }} >
          {isWeekly ? (
              <View> {/* 주간 모드 */}
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.date_text, {fontSize: s(28)}]}>2025년 {selectedMonth} </Text>
                  <Text style={[styles.date_text, {fontSize: s(28)}]}>{selectedWeek}</Text>
                  <View style={{ width: s(8) }} />
                  <TouchableOpacity onPress={() => setIsWeekWheelVisible(prev => !prev)}>
                      {isWeekWheelVisible ? <Up_Arrow/> : <Under_Arrow/> }
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: s(14), color: '#9B9B9B', fontFamily: 'Roboto', fontWeight: '400' }}>
                    {selectedMonth.replace('월', '')}.{startDay} ~ {endDay}
                </Text>
              </View>
          ) : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}> {/* 월간 모드 */}
                  <Text style={[styles.date_text, {fontSize: s(28)}]}>2025년 </Text>
                  <Text style={[styles.date_text, {fontSize: s(28)}]}>{selectedMonth}</Text>
                  <View style={{ width: s(8) }} />
                  <TouchableOpacity onPress={() => setIsMonthWheelVisible(prev => !prev)}>
                      {isMonthWheelVisible ? <Up_Arrow/> : <Under_Arrow/> }
                  </TouchableOpacity>
              </View>
          )}
          <View style={{zIndex: 10}}>
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
          <View style={[styles.wheel_card,{width: s(136), height: ITEM_HEIGHT * 5, borderRadius: s(16), marginLeft: s(144), marginTop: s(-8)}] }>
              <View style={{ flex: 1, borderRadius: s(16), overflow: 'hidden'}}>
                  <FlatList
                      data={WEEKS}
                      keyExtractor={item => item}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate='fast'
                      onMomentumScrollEnd={onWeekMomentumEnd}
                      getItemLayout={(_, index) => ({
                          length: ITEM_HEIGHT,
                          offset: ITEM_HEIGHT * index,
                          index,
                      })}
                      contentContainerStyle={{
                          paddingVertical: ITEM_HEIGHT * 2,
                      }}
                      renderItem={({item, index}) => {
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
                              <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center'}} >
                                <Text style={{fontSize, fontWeight: '700', opacity}} >
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
          <View style={[styles.wheel_card, {width: s(136), height: ITEM_HEIGHT * 5, borderRadius: s(16), marginLeft: s(72), marginTop: s(8)}]} >
            <View style={{ flex: 1, borderRadius: s(16), overflow: 'hidden'}}>
              <FlatList
                data={MONTHS}
                keyExtractor={item => item}
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
                    <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center'}} >
                      <Text style={{fontSize, fontWeight: '700', opacity}} >
                        {item}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          </View>
        )}
        
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

        {/* 감정 바 차트 */}
        <View style={{position: 'absolute', width: '100%', marginTop: s(282) }}>
          <EmotionBarChart
            emotions={EMOTIONS}
            data={currentEmotionData}
            highlightedKey={maxValue > 0 ? maxEmotion.key : null}
          />

        <View style={{width: '100%', height: s(8), backgroundColor: '#EEE', marginTop: s(32)}} />
          
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
      <View style={[styles.footer, {height: s(72), position: "absolute", left: s(0), right: s(0), bottom: s(8)}]}>
          
      </View>
    </SafeAreaView>
  );
};

export default Chart;

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
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
});
