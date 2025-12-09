import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useScale from '../../hooks/useScale';
import { DreamKeywordItem } from '../Chart_data/dreamType';

interface KeywordTop3Props {
  title: string;              // "이번 달..." / "이번 주..." 같은 타이틀
  items: DreamKeywordItem[];  // 이미 정렬된 TOP3 리스트
}

const DreamKeywordTop3 = ({ title, items }: KeywordTop3Props) => {
  const { s } = useScale();

  const top3 = items.slice(0, 3); // 혹시 3개 이상 들어와도 상위 3개만

  return (
    <View style={{ width: '100%', paddingHorizontal: s(16), marginTop: s(16)}}>
      <Text style={[styles.sectionTitle, { marginBottom: s(16), fontSize: s(16) }]}>
        {title}
      </Text>

      {top3.map((item, index) => (
        <View key={index} style={ { flexDirection: 'row', marginBottom: s(12) }}>
          {/* 회색 박스 */}
          <View style={{ width: s(64), height: s(64), backgroundColor: '#D9D9D9', marginRight: s(16) }} />

          {/* 텍스트 영역 */}
          <View style={{  flex: 1 }}>
            {/* 상단: 꿈 내용 요약 */}
            <Text
              style={[styles.dreamTitle, {marginBottom: s(8), fontSize: s(18)}]}
              numberOfLines={1}
            >
              {item.dreamSummary}
            </Text>

            {/* 하단: 해몽 내용 */}
            <Text
              style={[styles.interpretation, {fontSize: s(12)}]}
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

export default DreamKeywordTop3;

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: '700',
    color: '#313131',
    fontFamily: 'Roboto'
  },
  dreamTitle: {
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Roboto'
  },
  interpretation: {
    fontWeight: '400',
    color: '#A3A3A3',
    fontFamily: 'Roboto'
  },
});
