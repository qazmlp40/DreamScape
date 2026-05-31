import { API_BASE_URL, API_JSON_HEADERS, DEV_MOCK_AUTH } from '@/constants/api';
import { tokenStorage } from '@/utils/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleIcon from './Icons/google.svg';

export const BASE_WIDTH = 412;
const DREAMSCAPE_LOGO = require('../../assets/images/dreamscape-logo-stacked.png');
const FIND_ACCOUNT_ROUTE = '/find-account' as any;

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
          { height: s(56), paddingHorizontal: s(16) },
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
        { height: s(56) },
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
        headers: API_JSON_HEADERS,
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
        setGlobalErr('서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
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
      await Linking.openURL(authUrl);
    } catch {
      setGoogleErr('구글 로그인에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.logo_container, { marginTop: s(72) }]}>
          <Image
            source={DREAMSCAPE_LOGO}
            style={[styles.logoImage, { width: s(224), height: s(118) }]}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.form_container, { marginTop: s(52), marginHorizontal: s(32) }]}>
          <Input value={userID} setValue={setUserID} placeholder="이메일" />
          <View style={{ height: s(16) }} />
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

          <TouchableOpacity
            style={[styles.find_link, { marginTop: s(14) }]}
            onPress={() => router.push(FIND_ACCOUNT_ROUTE)}
          >
            <Text style={styles.link}>아이디/비밀번호 찾기</Text>
          </TouchableOpacity>

          <View style={{ marginTop: s(22) }}>
            <CompleteBtn
              onPress={handleLogin}
              disabled={isDisabled || loading}
              title={loading ? '로그인 중..' : '로그인'}
            />
          </View>

          <View style={[styles.google_divider_container, { marginTop: s(34) }]}>
            <View style={[styles.divider, { flex: 1, marginRight: s(12) }]} />
            <Text style={styles.google_text1}>간편 로그인</Text>
            <View style={[styles.divider, { flex: 1, marginLeft: s(12) }]} />
          </View>

          <TouchableOpacity
            style={[styles.google_button, { height: s(56), marginTop: s(18) }]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            activeOpacity={0.82}
          >
            <View style={styles.google_icon_wrap}>
              <GoogleIcon width={22} height={22} />
            </View>
            <Text style={styles.google_text2}>
              {googleLoading ? '로그인 중..' : 'Google로 계속하기'}
            </Text>
          </TouchableOpacity>

          {!!googleErr && (
            <Text style={[styles.error_text, { marginTop: s(8), textAlign: 'center' }]}>
              {googleErr}
            </Text>
          )}
        </View>

        <View style={[styles.signup_container, { marginBottom: s(26) }]}>
          <Text style={styles.signup_text}>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signup_link}> 회원가입</Text>
          </TouchableOpacity>
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
  logoImage: {
    alignSelf: 'center',
  },
  form_container: {
    width: 'auto',
  },
  find_link: {
    alignSelf: 'flex-end',
  },
  link: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#8B8B8B',
    textAlign: 'left',
    fontWeight: '400',
  },
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
    fontSize: 15,
    fontFamily: 'Roboto-Nomal',
    color: '#282828',
    textAlign: 'left',
    fontWeight: '400',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input_error: {
    width: '100%',
    borderColor: '#FF3D3D',
    borderWidth: 1,
    boxShadow: '0px 0px 1.5px rgba(0, 0, 0, 0.25)' as any,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#E5E7EB',
  },
  google_text1: {
    color: '#8B8B8B',
    fontSize: 13,
    fontWeight: '400',
  },
  google_text2: {
    color: '#282828',
    fontSize: 15,
    fontWeight: '600',
  },
  google_divider_container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  google_button: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  google_icon_wrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signup_container: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signup_text: {
    fontSize: 14,
    color: '#8B8B8B',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
  },
  signup_link: {
    fontSize: 14,
    color: '#BB7CFF',
    fontFamily: 'Roboto-Regular',
    fontWeight: '700',
  },
});
