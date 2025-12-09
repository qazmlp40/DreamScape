import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import useScale from '../../hooks/useScale';

type Mode = 'month' | 'week';

interface EmotionSummaryProps {
  mode: Mode;            // 'month' | 'week'
  count: number;         // 12
  verb: string;  // '슬펐'
  color: string;         // 감정 컬러 (파랑)
  Icon: React.ComponentType;
}

const ChartTitle = ({ mode, count,verb, color, Icon }: EmotionSummaryProps) => {

  const { s } = useScale();
  const prefix = mode === 'month' ? '이번 달은' : '이번 주는';

  return (
    <View>
      <Text style={[styles.prefix, {fontSize: s(24)}]}>{prefix}</Text>

      <View style={styles.container}>
        <Text style={[styles.content, {color, marginRight:s(4), fontSize: s(24)}]}>
          <Text>{count}번 </Text>
          <Text>{verb}</Text>
          <Text>어요</Text>
        </Text>
        <Icon/>
      </View>
  </View>
  );
};

export default ChartTitle;

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row'
    },
    prefix: {
        fontFamily: 'Roboto',
        color: '#000',
        fontWeight: '700'
    },
    content: {
        fontFamily: 'Roboto',
        fontWeight: '700'
    }
});