import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppDialogProvider } from '../contexts/AppDialogContext';
import { DreamRecordProvider } from '../contexts/DreamRecordContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DreamRecordProvider>
      <AppDialogProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthenticatedStack />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppDialogProvider>
    </DreamRecordProvider>
  );
}

function AuthenticatedStack() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const guardRoute = async () => {
      const token = await AsyncStorage.getItem('accessToken');

      if (!mounted) return;

      const rootSegment = segments[0];
      const isAuthRoute = rootSegment === '(auth)' || rootSegment === 'oauth';

      setIsReady(true);

      if (!token && !isAuthRoute) {
        router.replace('/(auth)/login');
        return;
      }

      if (token && rootSegment === '(auth)') {
        router.replace('/(tabs)');
      }
    };

    guardRoute();

    return () => {
      mounted = false;
    };
  }, [router, segments]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="record/step1" options={{ headerShown: false }} />
      <Stack.Screen name="record/step2" options={{ headerShown: false }} />
      <Stack.Screen name="record/step3" options={{ headerShown: false }} />
      <Stack.Screen name="record/step4" options={{ headerShown: false }} />
      <Stack.Screen name="record/step5" options={{ headerShown: false }} />
      <Stack.Screen name="setting" options={{ headerShown: false }} />
      <Stack.Screen name="inquiry" options={{ headerShown: false }} />
      <Stack.Screen name="dream-edit" options={{ headerShown: false }} />
      <Stack.Screen name="oauth" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
