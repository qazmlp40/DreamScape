import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppDialogProvider } from '../contexts/AppDialogContext';
import { DreamRecordProvider } from '../contexts/DreamRecordContext';
import { initKakao } from '../utils/kakaoInit';
import { tokenStorage } from '../utils/tokenStorage';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initKakao();
  }, []);

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
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const hasHandledInitialRoute = useRef(false);

  useEffect(() => {
    const checkToken = async () => {
      const t = await tokenStorage.getToken();
      setToken(t);
    };
    checkToken();

    const interval = setInterval(checkToken, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const guardRoute = async () => {
      if (token === undefined) return;
      if (!mounted) return;

      const rootSegment = segments[0];
      const isAuthRoute = rootSegment === '(auth)' || rootSegment === 'oauth';

      setIsReady(true);

      if (!hasHandledInitialRoute.current) {
        hasHandledInitialRoute.current = true;

        if (!isAuthRoute) {
          router.replace('/(auth)/login');
          return;
        }
      }

      if (!token && !isAuthRoute) {
        router.replace('/(auth)/login');
        return;
      }

    };

    guardRoute();

    return () => {
      mounted = false;
    };
  }, [router, segments, token]);

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
