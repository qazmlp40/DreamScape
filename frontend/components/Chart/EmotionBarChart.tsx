import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import useScale from '../../hooks/useScale';

type EmotionMeta = {
  key: string;                    // 'happy' 같은 키
  label: string;                  // '행복'
  color: string;                  // 메인 색
  Icon: React.ComponentType;      // 아이콘 컴포넌트
};

interface EmotionBarChartProps {
  emotions: EmotionMeta[];                // EMOTIONS 배열 그대로
  data: Record<string, number>;           // currentEmotionData 그대로
  highlightedKey: string | null;          // 최다 감정 key (없으면 null)
}

const EmotionBarChart = ({ emotions, data, highlightedKey }: EmotionBarChartProps) => {
  const { s } = useScale();
  const [activeKey, setActiveKey] = useState<string | null>(null); // 꾹 눌러서 개수 보여줄 대상

  const counts = emotions.map(e => data[e.key] ?? 0);
  const maxCount = Math.max(...counts, 0);
  const maxBarHeight = s(152); // 바 최대 높이


  return (
    <View style={{ width:'100%'}}>
        <View  style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: s(42) }}>
            {emotions.map(emotion => {
            const count = data[emotion.key] ?? 0;
            const ratio = count / maxCount || 0;
            const barHeight = Math.max(ratio * maxBarHeight, s(4)); // 0이어도 살짝 보이게

            const isHighlighted = emotion.key === highlightedKey;
            const isActive = activeKey === emotion.key;

            // 기본은 회색, 최다 감정만 컬러
            const barColor = isHighlighted ? emotion.color : '#E3E3E3';

            // 숫자 보여줄 조건: 최다 감정 OR 사용자가 꾹 눌러서 선택한 감정 -> 좀 있다 알아서 꺼져야함 (구현 아직 안됨됨)
            const isMax = emotion.key === highlightedKey
            const showCountLabel = isMax || isActive;


            return (
                <Pressable
                key={emotion.key}
                style={{ alignItems: 'center', flex: 1 }}
                onLongPress={() => {
                    // 🔹 최다 감정(highlightedKey)은 이미 항상 표시되므로 LongPress 동작 제외
                    if (!isMax) {
                      setActiveKey(emotion.key);      // 해당 감정의 개수 표시 활성화
                      setTimeout(() => setActiveKey(null), 700); // 0.7초 뒤 자동 숨김
                    }
                  }}
                  delayLongPress={300}
                >

                {/* 개수 텍스트 */}
                <View style={{ justifyContent: 'flex-end', marginBottom: s(5) }}>
                {isMax && (
                    <Text
                        style={[
                            styles.countText,
                            { color: isHighlighted ? emotion.color : '#E3E3E3', fontSize: s(16) }
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
                    styles.countText,
                    {
                        position: 'absolute',
                        bottom: barHeight + s(5), // 바 위에서 살짝 떨어져서
                        color: isHighlighted ? emotion.color : '#E3E3E3',
                        fontSize: s(16)
                    },
                    ]}
                >
                    {count}
                </Text>
                )}

                {/* 바 전체 트랙 */}
                <View style={[styles.barTrack, { width: s(40), height: maxBarHeight }]}>
                <View
                    style={[
                    styles.barFill,
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
        
        <View style={{ marginHorizontal: s(32), height: s(2), borderRadius: s(5), backgroundColor: '#9B9B9B'}}/>
          
          {/* 감정 태그 반복복 */}
          <View style={{ flexDirection: 'row', paddingHorizontal: s(42), marginTop: s(9) }}>
            {emotions.map(emotion => {
                const isHighlighted = emotion.key === highlightedKey;

                return (
                <View key={emotion.key} style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                    style={[
                        styles.labelText,
                        { color: isHighlighted ? emotion.color : '#1A1A1A', fontSize: s(12) } // 여기서 색상 결정
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

export default EmotionBarChart;

const styles = StyleSheet.create({
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
