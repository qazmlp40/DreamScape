import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OAuthScreen() {
  // 데이터 꺼내기
  const { accessToken, refreshToken, userId, email, error } = useLocalSearchParams();

  useEffect(() => {
    const saveLogin = async () => {
      if (error) {
        router.replace('/Login/Login');
        return;
      }

      if (!accessToken || !userId) return;

      // 토큰 저장 (로그인 유지)
      await AsyncStorage.setItem('accessToken', String(accessToken));
      await AsyncStorage.setItem('userId', String(userId));

      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', String(refreshToken));
      }

      if (email) {
        await AsyncStorage.setItem('email', String(email));
      }

      router.replace('/(tabs)');
    };

    saveLogin();
  }, [accessToken, refreshToken, userId, email, error]);

  return (
    <View style={styles.container}>
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
  },
});
