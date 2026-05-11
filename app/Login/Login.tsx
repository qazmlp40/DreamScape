import { API_BASE_URL, APP_SCHEME, DEV_MOCK_AUTH } from '@/constants/api';
import { tokenStorage } from '@/utils/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleIcon from './Icons/google.svg';
import Logo from './Icons/logo';

WebBrowser.maybeCompleteAuthSession();

export const BASE_WIDTH = 412;

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s };
}

function useLoginForm() {
  const [userID, setUserID] = useState('');
  const [userPW, setUserPW] = useState('');

  return { userID, setUserID, userPW, setUserPW };
}

type InputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
};

const Input: React.FC<InputProps> = ({ value, setValue, placeholder, secureTextEntry, error }) => {
  const { s } = useScale();

  return (
    <View>
      <TextInput
        style={[
          styles.input,
          error && styles.input_error,
          { paddingHorizontal: s(16), paddingVertical: s(20) },
        ]}
        onChangeText={setValue}
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

type CompleteBtnProps = {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
};

const CompleteBtn: React.FC<CompleteBtnProps> = ({ onPress, disabled = false, title }) => {
  const { s } = useScale();

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      style={[
        styles.button,
        disabled ? styles.button_disabled : styles.button_active,
        { height: s(60) },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const Login: React.FC = () => {
  const { s } = useScale();
  const { userID, setUserID, userPW, setUserPW } = useLoginForm();

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [googleErr, setGoogleErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isDisabled = userID.trim() === '' || userPW.trim() === '';

  const redirectUri = makeRedirectUri({
    scheme: APP_SCHEME,
    path: 'oauth',
  });

  const completeLogin = async (
    accessToken: string,
    userId?: string | number,
    refreshToken?: string,
  ) => {
    await tokenStorage.setToken(accessToken);

    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }

    if (userId !== undefined) {
      await AsyncStorage.setItem('userId', String(userId));
    }

    router.replace('/(tabs)');
  };

  const handleLogin = useCallback(async () => {
    if (loading) return;

    setPwError(false);
    setGlobalErr('');

    if (isDisabled) {
      setPwError(true);
      setGlobalErr('이메일 또는 비밀번호를 정확히 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);

      if (DEV_MOCK_AUTH) {
        await completeLogin('dev-access-token', '1');
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE_URL}/t_user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userID.trim(), password: userPW }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data?.accessToken) {
        await completeLogin(data.accessToken, data.userId, data.refreshToken);
        return;
      }

      setPwError(true);
      setGlobalErr(data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } catch (e: any) {
      setPwError(true);

      if (e.name === 'AbortError') {
        setGlobalErr('서버 응답 시간이 초과되었습니다. 네트워크 상태를 확인해 주세요.');
      } else {
        setGlobalErr(`서버 연결에 실패했습니다: ${API_BASE_URL}`);
      }
    } finally {
      setLoading(false);
    }
  }, [isDisabled, loading, userID, userPW]);

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading) return;

    try {
      setGoogleErr('');
      setGoogleLoading(true);

      const authUrl = `${API_BASE_URL}/oauth2/authorization/google`;

      // OAuth 로그인 후 앱 딥링크로 결과 받기
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== 'success' || !('url' in result) || !result.url) {
        if (result.type !== 'cancel' && result.type !== 'dismiss') {
          setGoogleErr('구글 로그인 흐름을 완료하지 못했습니다.');
        }
        return;
      }

      // 딥링크 URL에서 토큰 추출
      const { queryParams } = Linking.parse(result.url);

      const accessToken =
        typeof queryParams?.accessToken === 'string'
          ? queryParams.accessToken
          : typeof queryParams?.token === 'string'
            ? queryParams.token
            : undefined;

      const refreshToken =
        typeof queryParams?.refreshToken === 'string' ? queryParams.refreshToken : undefined;

      const userId =
        typeof queryParams?.userId === 'string' || typeof queryParams?.userId === 'number'
          ? queryParams.userId
          : undefined;

      const errorMessage =
        typeof queryParams?.error === 'string' ? queryParams.error : undefined;

      if (errorMessage) {
        setGoogleErr(errorMessage);
        return;
      }

      if (!accessToken) {
        setGoogleErr('구글 로그인 응답에 accessToken 이 없습니다.');
        return;
      }

      await completeLogin(accessToken, userId, refreshToken);
    } catch {
      setGoogleErr(`구글 로그인 연결에 실패했습니다: ${API_BASE_URL}`);
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading, redirectUri]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.logo_container, { marginTop: s(116), marginBottom: s(32) }]}>
          <Logo />
        </View>

        <View style={[styles.input_container, { marginTop: s(32), marginHorizontal: s(32) }]}>
          <Input value={userID} setValue={setUserID} placeholder="이메일" />
          <View style={{ height: 32 }} />
          <Input
            value={userPW}
            setValue={setUserPW}
            placeholder="비밀번호"
            secureTextEntry
            error={pwError}
          />
          {!!globalErr && (
            <Text style={[styles.error_text, { marginTop: s(8) }]}>{globalErr}</Text>
          )}
        </View>

        <View style={[styles.link_container, { marginTop: s(16), marginHorizontal: s(32) }]}>
          <Text style={styles.link}>아이디 비밀번호 찾기 |</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.link}> 회원가입하기</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.button_container,
            { position: 'absolute', left: s(16), right: s(16), bottom: s(23) },
          ]}
        >
          <CompleteBtn
            onPress={handleLogin}
            disabled={isDisabled || loading}
            title={loading ? '처리중..' : '완료'}
          />
        </View>

        <View style={[styles.google_container, { marginTop: s(44) }]}>
          <View style={styles.google_divider_container}>
            <View style={[styles.divider, { width: s(125), marginRight: s(16) }]} />
            <Text style={styles.google_text1}>간편 로그인</Text>
            <View style={[styles.divider, { width: s(125), marginLeft: s(16) }]} />
          </View>

          <View style={[styles.google_btn_container, { marginTop: s(32) }]}>
            <TouchableOpacity onPress={handleGoogleLogin} disabled={googleLoading}>
              <GoogleIcon />
            </TouchableOpacity>
            <Text style={[styles.google_text2, { marginTop: s(8) }]}>
              {googleLoading ? '로그인 중..' : '구글'}
            </Text>
            {!!googleErr && (
              <Text style={[styles.error_text, { marginTop: s(8) }]}>{googleErr}</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  logo_container: {
    width: '100%',
    alignItems: 'center',
  },
  input_container: {},
  link_container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  link: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#999',
    textAlign: 'left',
    fontWeight: '400',
  },
  button_container: {},
  error_text: {
    color: '#FF3D3D',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    textAlign: 'left',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    boxShadow: '0px 0px 1.5px rgba(0, 0, 0, 0.25)' as any,
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    fontFamily: 'Roboto-Nomal',
    color: '#999',
    textAlign: 'left',
    fontWeight: '400',
    borderRadius: 8,
  },
  input_error: {
    width: '100%',
    borderColor: '#FF3D3D',
    borderWidth: 1,
    boxShadow: '0px 0px 1.5px rgba(0, 0, 0, 0.25)' as any,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 8,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button_active: {
    backgroundColor: '#BB7CFF',
  },
  button_disabled: {
    backgroundColor: '#CACACA',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#999',
  },
  google_text1: {
    color: '#474747',
    fontSize: 14,
    fontWeight: '400',
  },
  google_text2: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
  },
  google_container: {
    width: '100%',
  },
  google_divider_container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  google_btn_container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
