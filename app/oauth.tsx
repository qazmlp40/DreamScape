import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fetchCurrentUser } from '../utils/authUser';
import { tokenStorage } from '../utils/tokenStorage';

export default function OAuthScreen() {
  const router = useRouter();
  const { accessToken, token, refreshToken, userId, email, error } = useLocalSearchParams();

  useEffect(() => {
    const saveLoginInfo = async () => {
      try {
        console.log('OAuth params:', {
          hasAccessToken: Boolean(accessToken),
          hasToken: Boolean(token),
          hasRefreshToken: Boolean(refreshToken),
          userId,
          email,
          error,
        });

        if (error) {
          console.log('OAuth error:', error);
          router.replace('/(auth)/login');
          return;
        }

        const loginToken = accessToken ?? token;

        if (!loginToken) {
          console.log('accessToken 없음');
          router.replace('/(auth)/login');
          return;
        }

        const accessTokenValue = String(loginToken);
        await tokenStorage.setToken(accessTokenValue);
        await AsyncStorage.setItem('accessToken', accessTokenValue);

        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', String(refreshToken));
        }

        let resolvedUserId = userId ? String(userId) : undefined;
        let resolvedEmail = email ? String(email) : undefined;

        if (!resolvedUserId) {
          const currentUser = await fetchCurrentUser(accessTokenValue);
          resolvedUserId = currentUser.userId;
          resolvedEmail = resolvedEmail ?? currentUser.email;
        }

        if (!resolvedUserId) {
          console.log('userId 없음');
          router.replace('/(auth)/login');
          return;
        }

        await AsyncStorage.setItem('userId', resolvedUserId);

        if (resolvedEmail) {
          await AsyncStorage.setItem('email', resolvedEmail);
        }

        console.log('Google 로그인 토큰 저장 성공');
        console.log('userId:', resolvedUserId);
        console.log('email:', resolvedEmail);

        router.replace('/(tabs)');
      } catch (saveError) {
        console.log('OAuth 저장 실패:', saveError);
        router.replace('/(auth)/login');
      }
    };

    saveLoginInfo();
  }, [accessToken, token, refreshToken, userId, email, error, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: '#222',
    fontSize: 16,
    marginTop: 12,
  },
});
