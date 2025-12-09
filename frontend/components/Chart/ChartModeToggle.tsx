import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useScale from '../../hooks/useScale';

interface ChartModeToggleProps {
  isWeekly: boolean;                    // true : 주간 / false : 월간
  onChangeMode: (isWeekly: boolean) => void;
}

const ChartModeToggle = ({ isWeekly, onChangeMode }: ChartModeToggleProps) => {
  const { s } = useScale(); 

  return (
    <View style={[styles.toggleContainer, {width: s(98), height: s(36), paddingHorizontal: s(2), borderRadius: s(32)}]}>
      {/* 주간 버튼 */}
      <TouchableOpacity
        style={[
          styles.segment,
          isWeekly && styles.segmentActive,  // 선택됐을 때 스타일
          {width: s(46), height: s(32), borderRadius: s(32)}
        ]}
        onPress={() => onChangeMode(true)}
      >
        <Text
          style={[
            styles.segmentText,
            isWeekly && styles.segmentTextActive,
          {fontSize: s(12)}]}
        >
          주간
        </Text>
      </TouchableOpacity>

      {/* 달력 버튼 */}
      <TouchableOpacity
        style={[
          styles.segment,
          !isWeekly && styles.segmentActive,
          {width: s(46), height: s(32), borderRadius: s(32)}
        ]}
        onPress={() => onChangeMode(false)}
      >
        <Text
          style={[
            styles.segmentText,
            !isWeekly && styles.segmentTextActive,
          {fontSize: s(12)}]}
        >
          달력
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // 바깥 둥근 배경
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF0F4',     // 연한 회색 배경
    justifyContent: "center",
    alignItems: "center"
  },
  // 각 세그먼트(버튼)
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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

export default ChartModeToggle;
