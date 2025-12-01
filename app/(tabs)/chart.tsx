import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ChartScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '차트',
          headerShown: true, // 헤더를 다시 표시합니다.
        }} 
      />
      <Text style={styles.text}>차트 화면 (구현 예정)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    color: '#1F2937',
  },
});


