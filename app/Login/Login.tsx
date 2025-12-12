import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
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
import Logo from './Icons/logo';

const BASE_URL = 'http://10.0.2.2:8080';

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

  const isDisabled = userID.trim() == '' || userPW.trim() == '';

  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (loading) return;
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
      const res = await fetch(`${BASE_URL}/t_user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userID.trim(), password: userPW }),
      });
      const data = await res.json();

      // 성공 판정: token 유무로 체크
      if (res.ok && data?.accessToken) {
        const token = data.accessToken;

        // 토큰 저장
        await AsyncStorage.setItem('accessToken', token);

        // userId 저장
        if (data.userId) {
          await AsyncStorage.setItem('userId', String(data.userId));
          console.log('userId 저장 완료:', data.userId);
        }

        console.log('로그인 성공, 토큰 저장 완료:', token);

        // 로그인 성공 -> 페이지 이동
        router.replace('/(tabs)');
        setLoading(false);
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
      setGlobalErr('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [userID, userPW, isDisabled, loading]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.logo_container, { marginTop: s(116), marginBottom: s(32) }]}>
          <Logo />
        </View>

        <View style={[styles.input_container, { marginTop: s(32), marginHorizontal: s(32) }]}>
          <Input value={userID} setValue={setUserID} placeholder="아이디" />
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
          <CompleteBtn onPress={handleLogin} disabled={isDisabled || loading} title="완료" />
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
});
