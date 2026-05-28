import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* -----------------------------------------
📌 useScale (병합)
------------------------------------------ */
const BASE_WIDTH = 412;
function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

/* -----------------------------------------
📌 Profile_input (병합)
------------------------------------------ */
interface ProfileInputProps {
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: any;
}

const Profile_input = ({ value, setValue, placeholder, secureTextEntry = false, multiline = false, style }: ProfileInputProps) => {
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
          styles.input,
          { paddingHorizontal: s(16), paddingVertical: s(20) },
          multiline && { textAlignVertical: 'top' },
          style,
        ]}
      />
    </View>
  );
};

/* -----------------------------------------
📌 CompleteBtn (병합)
------------------------------------------ */
interface CompleteBtnProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
}

const CompleteBtn = ({ onPress, disabled = false, title }: CompleteBtnProps) => {
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
      <Text style={styles.btn_text}>{title}</Text>
    </TouchableOpacity>
  );
};

/* -----------------------------------------
📌 Profile_Inquiry 페이지 본체
------------------------------------------ */
const Inquiry = () => {
  const { s } = useScale();


  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleSend = () => {
    setIsPopupVisible(true);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={[
          styles.header_container,
          { height: s(64), paddingHorizontal: s(4), marginBottom: s(48) },
        ]}
      >
        <TouchableOpacity style={{ zIndex: 1 }} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={s(24)} color="#2E2E34" />
        </TouchableOpacity>
        <Text style={styles.header_text}>문의하기</Text>
      </View>

      <View style={[styles.input_container, { marginHorizontal: s(16) }]}>
        <Profile_input placeholder="제목" value={title} setValue={setTitle} />

        <Profile_input
          placeholder="문의 내용"
          value={content}
          setValue={setContent}
          multiline
          style={{ height: s(308) }}
        />
      </View>

      <View style={[{ position: 'absolute', left: s(16), right: s(16), bottom: s(23) }]}>
        <CompleteBtn title="전송" onPress={handleSend} />
      </View>

      {isPopupVisible && (
        <View style={styles.popup_overlay}>
          <View style={[styles.popup_box, { width: s(348), height: s(160) }]}>
            <Text style={styles.text1}>문의 전송이 성공하였습니다!</Text>
            <Text style={styles.text2}>소중한 의견 감사합니다.</Text>
            <View style={{ width: s(152), position: 'absolute', bottom: s(10) }}>
              <CompleteBtn title="확인" onPress={() => router.back()} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Inquiry;

/* -----------------------------------------
📌 Styles
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
    fontFamily: 'Roboto-Medium',
    color: '#2E2E34',
  },
  input_container: { gap: 32 },
  input: {
    width: '100%',
    borderRadius: 8,
    fontSize: 16,
    color: '#808991',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1.5,
    elevation: 2,
  },
  button: { width: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  button_active: { backgroundColor: '#BB7CFF' },
  button_disabled: { backgroundColor: '#CACACA' },
  btn_text: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#FFF',
    fontWeight: '700',
  },
  popup_overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup_box: {
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    paddingTop: 16,
  },
  text1: { fontSize: 20, color: '#232527', fontWeight: '700', marginBottom: 6 },
  text2: { fontSize: 14, color: '#808991', fontWeight: '500' },
});
