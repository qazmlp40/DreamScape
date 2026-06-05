import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_WIDTH = 412;

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s };
}

type ProfileInputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: TextStyle;
};

const ProfileInput = ({
  value,
  setValue,
  placeholder,
  secureTextEntry = false,
  style,
}: ProfileInputProps) => {
  const { s } = useScale();

  return (
    <TextInput
      autoCapitalize="none"
      onChangeText={setValue}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      style={[styles.input, { height: s(60), paddingHorizontal: s(16) }, style]}
      value={value}
    />
  );
};

type CompleteBtnProps = {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  title: string;
};

const CompleteBtn = ({ onPress, disabled = false, loading = false, title }: CompleteBtnProps) => {
  const { s } = useScale();

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonActive,
        { height: s(60) },
      ]}
    >
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
};

const Setting = () => {
  const { s } = useScale();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordCheck, setNewPasswordCheck] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(
    () =>
      loading ||
      currentPassword.trim() === '' ||
      newPassword.trim() === '' ||
      newPasswordCheck.trim() === '',
    [currentPassword, loading, newPassword, newPasswordCheck],
  );

  const handleChangePassword = async () => {
    if (loading) return;

    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('새 비밀번호는 8자 이상 입력해 주세요.');
      return;
    }

    if (newPassword !== newPasswordCheck) {
      setErrorMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post('/t_user/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert('완료', data?.message || '비밀번호가 변경되었습니다.', [
        {
          text: '확인',
          onPress: () => router.replace('/(tabs)/profile'),
        },
      ]);

      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordCheck('');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View
        style={[
          styles.headerContainer,
          { height: s(64), paddingHorizontal: s(4), marginBottom: s(48) },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color="#2E2E34" name="arrow-back" size={s(24)} />
        </TouchableOpacity>
        <Text style={styles.headerText}>프로필 설정</Text>
      </View>

      <View style={[styles.inputContainer, { marginHorizontal: s(16) }]}>
        <ProfileInput
          placeholder="현재 비밀번호"
          secureTextEntry
          setValue={setCurrentPassword}
          value={currentPassword}
        />
        <ProfileInput
          placeholder="새 비밀번호"
          secureTextEntry
          setValue={setNewPassword}
          value={newPassword}
        />
        <ProfileInput
          placeholder="새 비밀번호 확인"
          secureTextEntry
          setValue={setNewPasswordCheck}
          value={newPasswordCheck}
        />
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>

      <View style={{ position: 'absolute', left: s(16), right: s(16), bottom: s(23) }}>
        <CompleteBtn
          disabled={isDisabled}
          loading={loading}
          onPress={handleChangePassword}
          title="완료"
        />
      </View>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    zIndex: 1,
  },
  headerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Roboto-Nomal',
    color: '#2E2E34',
    fontWeight: '400',
  },
  inputContainer: {
    gap: 20,
  },
  input: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#282828',
    elevation: 2,
    fontFamily: 'Roboto-Nomal',
    fontSize: 16,
    fontWeight: '400',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1.5,
  },
  errorText: {
    color: '#FF3D3D',
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    fontWeight: '400',
  },
  button: {
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#BB7CFF',
  },
  buttonDisabled: {
    backgroundColor: '#CACACA',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },
});
