// Profile_Setting.tsx (useScale + Back_Btn + Profile_input + CompleteBtn 통합 버전)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* -----------------------------------------
📌 useScale (통합)
------------------------------------------ */

const BASE_WIDTH = 412; // 피그마 화면의 넓이

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

/* -----------------------------------------
📌 Profile_input (통합)
------------------------------------------ */

type ProfileInputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: TextStyle;
};

const Profile_input = ({
  value,
  setValue,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  style,
}: ProfileInputProps) => {
  const { s } = useScale();

  return (
    <View>
      <TextInput
        onChangeText={setValue}
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[
          inputStyles.input,
          { paddingHorizontal: s(16), paddingVertical: s(20) },
          multiline && { textAlignVertical: 'top' },
          style,
        ]}
      />
    </View>
  );
};

const inputStyles = StyleSheet.create({
  input: {
    width: '100%',
    boxShadow: '0px 0px 1.5px rgba(0, 0, 0, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: 'Roboto-Nomal',
    color: '#808991',
    textAlign: 'left',
    fontWeight: '400',
    borderRadius: 8,
  },
});

/* -----------------------------------------
📌 CompleteBtn (통합)
------------------------------------------ */

interface ButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
}

const CompleteBtn = ({ onPress, disabled = false, title }: ButtonProps) => {
  const { s } = useScale();

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      style={[
        completeBtnStyles.button,
        disabled ? completeBtnStyles.button_disabled : completeBtnStyles.button_active,
        { height: s(60) },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <Text style={completeBtnStyles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const completeBtnStyles = StyleSheet.create({
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

/* -----------------------------------------
📌 Profile_Setting 페이지 본체
------------------------------------------ */

const Setting = () => {
  const { s } = useScale();
  const navigation = useNavigation();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPW] = useState('');
  const [pwCheck, setPWCheck] = useState('');

  const handleUpdate = () => {
    // TODO: 나중에 수정 API 연동
    navigation.navigate('Profile' as never);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 헤더 */}
      <View
        style={[
          styles.header_container,
          { height: s(64), paddingHorizontal: s(4), marginBottom: s(48) },
        ]}
      >
        <TouchableOpacity style={{ zIndex: 1 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={s(24)} color="#2E2E34" />
        </TouchableOpacity>
        <Text style={styles.header_text}>프로필</Text>
      </View>

      {/* 입력 영역 */}
      <View style={[styles.input_container, { marginHorizontal: s(16) }]}>
        <Profile_input placeholder="닉네임" value={nickname} setValue={setNickname} />
        <Profile_input placeholder="이메일" value={email} setValue={setEmail} />
        <Profile_input placeholder="비밀번호 변경" value={pw} setValue={setPW} />
        <Profile_input placeholder="비밀번호 확인" value={pwCheck} setValue={setPWCheck} />
      </View>

      {/* 완료 버튼 */}
      <View style={{ position: 'absolute', left: s(16), right: s(16), bottom: s(23) }}>
        <CompleteBtn title="완료" onPress={()=>{router.push('/(tabs)/profile')}} />
      </View>
    </SafeAreaView>
  );
};

export default Setting;

/* -----------------------------------------
📌 Styles (페이지 전용)
------------------------------------------ */

const styles = StyleSheet.create({
  header_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  header_text: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Roboto-Nomal',
    color: '#2E2E34',
    fontWeight: '400',
    zIndex: -1,
  },
  input_container: {
    width: '100%',
    gap: 20,
  },
});
