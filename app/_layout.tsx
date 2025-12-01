import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* ⭐️⭐️⭐️ 여기에 record/step1 화면을 추가하고 headerShown: false 설정 ⭐️⭐️⭐️ 
          Expo Router는 파일 시스템 기반 라우팅을 사용하므로, 
          name 속성은 파일 경로(확장자 제외)를 사용합니다. 
          경로가 app/record/step1.tsx라면 name="record/step1"입니다.
        */}
        <Stack.Screen name="record/step1" options={{ headerShown: false }} />
        <Stack.Screen name="record/step2" options={{ headerShown: false }} />
        <Stack.Screen name="record/step3" options={{ headerShown: false }} /> 
        <Stack.Screen name="record/step4" options={{ headerShown: false }} />
       

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}