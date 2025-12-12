import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Logo from './Icons/logo';

/* -----------------------------------------
  📌 useScale 훅
------------------------------------------ */
export const BASE_WIDTH = 412;

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

/* -----------------------------------------
  📌 Right_Arrow 아이콘
------------------------------------------ */
const Right_Arrow: React.FC = () => {
  const { s } = useScale();
  const W = 10;
  const H = 18;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={s(W)}
      height={s(H)}
      viewBox="0 0 10 18"
      fill="none"
    >
      <Path
        d="M0.99995 17.75C1.19902 17.7509 1.39007 17.6716 1.52995 17.53L9.52995 9.52997C9.8224 9.23715 9.8224 8.76279 9.52995 8.46997L1.52995 0.469969C1.23444 0.19461 0.773941 0.202735 0.488329 0.488347C0.202717 0.773959 0.194592 1.23446 0.469951 1.52997L7.93995 8.99997L0.469951 16.47C0.177497 16.7628 0.177497 17.2372 0.469951 17.53C0.609835 17.6716 0.800884 17.7509 0.99995 17.75Z"
        fill="#282828"
      />
    </Svg>
  );
};

/* -----------------------------------------
  📌 useSignupForm 훅
------------------------------------------ */
function useSignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [ID, setID] = useState('');
  const [PW, setPW] = useState('');
  const [checkPW, setCheckPW] = useState('');

  const reset = () => {
    setUsername('');
    setEmail('');
    setID('');
    setPW('');
    setCheckPW('');
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    ID,
    setID,
    PW,
    setPW,
    checkPW,
    setCheckPW,
    reset,
  };
}

/* -----------------------------------------
  📌 Input 컴포넌트
------------------------------------------ */
type InputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
};

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder,
  secureTextEntry,
  error,
}) => {
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

/* -----------------------------------------
  📌 CheckBtn 컴포넌트
------------------------------------------ */
type CheckBtnProps = {
  checked: boolean;
  setChecked: (value: boolean) => void;
};

const CheckBtn: React.FC<CheckBtnProps> = ({ checked, setChecked }) => {
  const { s } = useScale();
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setChecked(!checked)}>
      <View
        style={[
          styles.check_circle,
          checked ? styles.check_on : styles.check_off,
          { width: s(24), height: s(24) },
        ]}
      >
        <MaterialIcons name="check" size={s(17)} color={checked ? '#FFF' : '#282828'} />
      </View>
    </TouchableOpacity>
  );
};

/* -----------------------------------------
  📌 CompleteBtn 컴포넌트
------------------------------------------ */
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
      <Text style={styles.button_text}>{title}</Text>
    </TouchableOpacity>
  );
};

/* -----------------------------------------
  📌 Signup 페이지 본체
------------------------------------------ */
const BASE_URL = 'http://10.0.2.2:8080';

const Signup: React.FC = () => {
  const navigation = useNavigation();
  const { s } = useScale();
  const { username, setUsername, email, setEmail, ID, setID, PW, setPW, checkPW, setCheckPW } =
    useSignupForm();

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [termChecked, setTermChecked] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setScrollEnabled(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setScrollEnabled(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isDisabled =
    ID.trim() === '' ||
    PW.trim() === '' ||
    email.trim() === '' ||
    checkPW.trim() === '' ||
    termChecked === false;

  const toggleTerms = useCallback(() => {
    setTermChecked(prev => !prev);
  }, []);

  const handleSignup = useCallback(async () => {
    setPwError(false);
    setGlobalErr('');

    if (PW !== checkPW) {
      setPwError(true);
      setGlobalErr('비밀번호를 잘못 입력하였습니다');
      return;
    }

    if (isDisabled) {
      setGlobalErr('입력값을 확인하고 약관에 동의해 주세요.');
      return;
    }

    try {
      const payload = {
        userNickName: ID.trim(),
        name: username.trim(),
        email: email.trim().toLowerCase(),
        password: PW,
        profileImage: 'https://picsum.photos/200/200',
        socialProvider: 'local',
      };

      const res = await fetch(`${BASE_URL}/t_user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: { message?: string } = {};

      try {
        data = JSON.parse(text);
      } catch {
        // JSON 아닐 수도 있으니 무시
      }

      if (!res.ok) {
        setGlobalErr(data?.message || '회원가입에 실패했습니다.');
        return;
      }

      // 성공
      router.replace('/(auth)/login');
    } catch (e) {
      setGlobalErr('서버에 연결할 수 없습니다.');
    }
  }, [PW, checkPW, username, ID, email, isDisabled, navigation]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          style={styles.scroll}
          scrollEnabled={scrollEnabled}
          enableOnAndroid
          extraScrollHeight={20}
        >
          {/* 로고 */}
          <View style={[styles.logo_container, { marginTop: s(68), marginBottom: s(32) }]}>
            <Logo />
          </View>

          {/* 입력창 */}
          <View style={[styles.input_container, { marginHorizontal: s(32) }]}>
            <Input value={username} setValue={setUsername} placeholder="이름" />
            <View style={{ height: s(16) }} />
            <Input value={email} setValue={setEmail} placeholder="이메일" />
            <View style={{ height: s(16) }} />
            <Input value={ID} setValue={setID} placeholder="아이디" />
            <View style={{ height: s(16) }} />
            <Input
              value={PW}
              setValue={setPW}
              placeholder="비밀번호"
              secureTextEntry
              error={pwError}
            />
            <View style={{ height: s(16) }} />
            <Input
              value={checkPW}
              setValue={setCheckPW}
              placeholder="비밀번호 확인"
              secureTextEntry
              error={pwError}
            />
          </View>

          {/* 에러 메시지 */}
          {!!globalErr && (
            <Text
              style={[
                styles.error_text,
                { marginHorizontal: s(32), marginTop: s(8) },
              ]}
            >
              {globalErr}
            </Text>
          )}

          {/* 약관 동의 */}
          <View style={[styles.terms_container, { marginHorizontal: s(16), marginTop: s(32) }]}>
            <View style={styles.checkbox_container}>
              <CheckBtn checked={termChecked} setChecked={toggleTerms} />
              <Text style={[styles.terms_text, { marginLeft: s(16) }]}>
                회원가입 및 이용약관에 동의하겠습니까?
              </Text>
            </View>
          </View>

          {/* 약관 상세보기 */}
          <View
            style={[
              styles.terms_detail_container,
              { marginTop: s(30), marginHorizontal: s(36), paddingLeft: s(36) },
            ]}
          >
            <Text style={styles.detail_text}>이용약관 확인하기</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/terms')}
            >
              <Right_Arrow />
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        {/* 완료 버튼 */}
        <View
          style={[
            styles.button_container,
            { position: 'absolute', left: s(16), right: s(16), bottom: s(23) },
          ]}
        >
          <CompleteBtn onPress={() => {router.replace('/(auth)/login')}} disabled={isDisabled} title="완료" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;

/* -----------------------------------------
  📌 스타일
------------------------------------------ */
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
  scroll: {},
  input_container: {},
  error_text: {
    color: '#FF3D3D',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
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
  terms_container: {},
  checkbox_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  check_circle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check_off: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#282828',
  },
  check_on: {
    backgroundColor: '#BB7CFF',
    borderColor: '#BB7CFF',
  },
  terms_text: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#282828',
    fontWeight: '500',
  },
  terms_detail_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detail_text: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#282828',
    fontWeight: '500',
  },
  button_container: {},
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
  button_text: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },
});
