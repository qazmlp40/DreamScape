import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DreamRecordProvider } from '../contexts/DreamRecordContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DreamRecordProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="record/step1" options={{ headerShown: false }} />
          <Stack.Screen name="record/step2" options={{ headerShown: false }} />
          <Stack.Screen name="record/step3" options={{ headerShown: false }} /> 
          <Stack.Screen name="record/step4" options={{ headerShown: false }} />
          <Stack.Screen name="record/step5" options={{ headerShown: false }} />
          <Stack.Screen name="setting" options={{ headerShown: false }} />
          <Stack.Screen name="inquiry" options={{ headerShown: false }} />
          <Stack.Screen name="dream-edit" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DreamRecordProvider>
  );
}