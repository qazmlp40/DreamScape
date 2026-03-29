/**
 * 로그인 페이지
 * 
 * 수정 사항:
 * 1. API_BASE_URL 사용 - constants/api.ts에서 import하여 서버 URL 통합 관리
 * 2. 타임아웃 처리 - 10초 타임아웃 추가 (AbortController 사용)
 * 3. 로딩 상태 표시 - 로그인 중일 때 "처리중..." 표시 및 버튼 비활성화
 * 4. 에러 메시지 개선 - 타임아웃/연결 실패 시 구체적인 메시지 표시
 * 5. 중복 요청 방지 - loading 상태로 중복 클릭 방지
 */
import { API_BASE_URL, DEV_MOCK_AUTH } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { router, Stack } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from 'react';
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

/* ------------------ useScale 훅 ------------------ */

export const BASE_WIDTH = 412; // 피그마 화면의 넓이

function useScale() {
  const width = useWindowDimensions().width; // 현재 기기의 화면 넓이

  const s = (px: number) => px * (width / BASE_WIDTH);

  return { s, width };
}

/* ------------------ useLoginForm 훅 ------------------ */

function useLoginForm() {
  const [userID, setUserID] = useState('');
  const [userPW, setUserPW] = useState('');

  const reset = () => {
    setUserID('');
    setUserPW('');
  };

  return { userID, setUserID, userPW, setUserPW, reset };
}

/* ------------------ Input 컴포넌트 ------------------ */

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

/* ------------------ CompleteBtn 컴포넌트 ------------------ */

interface CompleteBtnProps {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
}

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

/* ------------------ Login 페이지 ------------------ */

const Login: React.FC = () => {
  const { s } = useScale();
  const navigation = useNavigation();

  const { userID, setUserID, userPW, setUserPW } = useLoginForm();

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [googleErr, setGoogleErr] = useState('');

  const isDisabled = userID.trim() == '' || userPW.trim() == '';

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 구글 로그인 후 리다이렉트 주소
  const redirectUri = makeRedirectUri({
    scheme: 'dreamappnew',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '임시 ANDROID_CLIENT_ID',
    iosClientId: '임시 IOS_CLIENT_ID',
    webClientId: '임시 WEB_CLIENT_ID',
    redirectUri,
  });

  // 앱 로그인 완료 처리 (구글 로그인이랑 그냥 로그인 공통으로 쓰는거)
  const completeLogin = async (token: string, userId?: string | number) => {
    await AsyncStorage.setItem('accessToken', token);
  
    if (userId !== undefined) {
      await AsyncStorage.setItem('userId', String(userId));
    }
  
    router.replace('/(tabs)');
  };

  // 로그인 처리 함수
  const handleLogin = useCallback(async () => {
    console.log("✅ handleLogin pressed");
    if (loading) return; // 중복 요청 방지
    setPwError(false);
    setGlobalErr('');

    if (isDisabled) {
      setPwError(true);
      setGlobalErr(
        '아이디(로그인 전화번호, 로그인 전용 아이디) 또는 비밀번호가 잘못되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요.',
      );
      return;
    }

    try {
      setLoading(true);

      if (DEV_MOCK_AUTH) {
        // await AsyncStorage.setItem('accessToken', 'dev-access-token');
        // await AsyncStorage.setItem('userId', '1');
        await completeLogin('dev-access-token', '1');
        console.log('DEV_MOCK_AUTH 로그인 우회');
        return;
      }
      
      // 10초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/t_user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userID.trim(), password: userPW }),
        signal: controller.signal, // 타임아웃 신호
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();

      // 성공 판정: token 유무로 체크
      if (res.ok && data?.accessToken) {
        await completeLogin(data.accessToken, data.userId);
        console.log('로그인 성공');
        return;
      }

      // 실패 처리
      setPwError(true);
      setGlobalErr(
        data?.message ||
          '아이디(로그인 전화번호, 로그인 전용 아이디) 또는 비밀번호가 잘못되었습니다.',
      );
    } catch (e: any) {
      console.log('에러 발생:', e?.message);
      setPwError(true);
      // 타임아웃과 일반 에러 구분
      if (e.name === 'AbortError') {
        setGlobalErr('서버 응답 시간 초과. 네트워크를 확인해주세요.');
      } else {
        setGlobalErr(`서버 연결 실패: ${API_BASE_URL}`);
      }
    } finally {
      setLoading(false);
    }
  }, [userID, userPW, isDisabled, loading]);
  
  // 구글 로그인 시작 버튼
  const handleGoogleLogin = async () => {
    try {
      setGoogleErr('');
      setGoogleLoading(true);
  
      await promptAsync(); // 구글 로그인 창 열기
    } catch (error) {
      console.log('구글 로그인 에러:', error);
      setGoogleErr('구글 로그인 창을 여는 데 실패했습니다.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // 구글 로그인 성공 후 응답 처리
  const handleGoogleAuthSuccess = async (googleResult: any) => {
    console.log('구글 인증 성공 응답:', googleResult);

    const idToken = googleResult?.authentication?.idToken;
    const accessToken = googleResult?.authentication?.accessToken;
  
    console.log('idToken:', idToken);
    console.log('accessToken:', accessToken);

    // 토큰 꺼내기 (idToken/ accessToken)
    // 백엔드 api 호출 
    // completeLogin(data.accessToken, data.userId) : 성공 처리 함수 호출 
  };

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthSuccess(response);
    }
  }, [response]);
  
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
          <Text style={styles.link}>아이디, 비밀번호 찾기 |</Text>
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
          {/* 완료 버튼 - 로딩 중일 때 "처리중..." 표시 */}
          <CompleteBtn onPress={handleLogin} disabled={isDisabled || loading} title={loading ? "처리중..." : "완료"} />
        </View>
        <View style={[styles.google_container, {marginTop: s(44)}]}>
          <View style={styles.google_divider_container}>
            <View style={[styles.divider,{width: s(125), marginRight: s(16)}]}/>
            <Text style={styles.google_text1}>간편 로그인</Text>
            <View style={[styles.divider,{width: s(125), marginLeft: s(16)}]}/>
          </View>
          <View style={[styles.google_btn_container, {marginTop: s(32)}]}>
            <TouchableOpacity onPress={handleGoogleLogin} disabled={!request || googleLoading}>
              <GoogleIcon/>
            </TouchableOpacity>
            <Text style={[styles.google_text2, {marginTop: s(8)}]}>구글</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

/* ------------------ styles ------------------ */

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
  divider_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 32,
    marginTop: 108,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#999',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#474747',
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
    // RN에선 boxShadow가 정식 속성은 아니지만, 원래 코드 유지
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
  divider:{
    height: 1,
    backgroundColor: '#999',
  },
  google_text1: {
    color: '#474747',
    fontSize: 14,
    fontWeight: 400
  },
  google_text2: {
    color: '#000',
    fontSize: 14,
    fontWeight: 400
  },
  google_container: {
    width: "100%",
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
  }
});
 