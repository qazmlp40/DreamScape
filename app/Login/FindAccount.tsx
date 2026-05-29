import { API_BASE_URL, DEV_MOCK_AUTH } from '@/constants/api';
import { useAppDialog } from '@/contexts/AppDialogContext';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const BASE_WIDTH = 412;

type Mode = 'email' | 'password';

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s };
}

type InputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
};

const Input: React.FC<InputProps> = ({ value, setValue, placeholder, keyboardType = 'default' }) => {
  const { s } = useScale();

  return (
    <TextInput
      style={[styles.input, { height: s(56), paddingHorizontal: s(16) }]}
      value={value}
      onChangeText={setValue}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  );
};

const FindAccount: React.FC = () => {
  const { s } = useScale();
  const { showDialog } = useAppDialog();
  const [mode, setMode] = useState<Mode>('email');
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailMode = mode === 'email';
  const isDisabled = isEmailMode
    ? name.trim() === '' || nickName.trim() === ''
    : email.trim() === '' || name.trim() === '';

  const switchMode = useCallback(
    (nextMode: Mode) => {
      if (mode === nextMode) return;
      setMode(nextMode);
      setError('');
    },
    [mode],
  );

  const submitFindEmail = useCallback(async () => {
    if (DEV_MOCK_AUTH) {
      showDialog({
        title: '아이디 찾기',
        message: '가입된 이메일은 dreamer@example.com 입니다.',
      });
      return;
    }

    const res = await fetch(`${API_BASE_URL}/t_user/find-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        userNickName: nickName.trim(),
      }),
    });

    const data = await res.json();

    if (data?.email) {
      showDialog({
        title: '아이디 찾기',
        message: `가입된 이메일은 ${data.email} 입니다.`,
      });
      return;
    }

    setError(data?.message || '일치하는 회원 정보를 찾지 못했어요.');
  }, [name, nickName, showDialog]);

  const submitFindPassword = useCallback(async () => {
    if (DEV_MOCK_AUTH) {
      showDialog({
        title: '비밀번호 찾기',
        message: '임시 비밀번호가 발급되었습니다. 임시 비밀번호: temp1234',
      });
      return;
    }

    const res = await fetch(`${API_BASE_URL}/t_user/find-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        name: name.trim(),
      }),
    });

    const data = await res.json();
    const message = data?.message || '일치하는 회원 정보를 찾지 못했어요.';

    if (data?.userId || message.includes('임시')) {
      showDialog({
        title: '비밀번호 찾기',
        message,
      });
      return;
    }

    setError(message);
  }, [email, name, showDialog]);

  const handleSubmit = useCallback(async () => {
    if (loading) return;

    setError('');

    if (isDisabled) {
      setError('필수 정보를 모두 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);
      if (isEmailMode) {
        await submitFindEmail();
      } else {
        await submitFindPassword();
      }
    } catch {
      setError('서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, [isDisabled, isEmailMode, loading, submitFindEmail, submitFindPassword]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: s(32), paddingTop: s(32), paddingBottom: s(32) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>이전</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { marginTop: s(28) }]}>아이디/비밀번호 찾기</Text>

        <View style={[styles.segment, { marginTop: s(28), height: s(48) }]}>
          <TouchableOpacity
            style={[styles.segmentButton, isEmailMode && styles.segmentButtonActive]}
            onPress={() => switchMode('email')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentText, isEmailMode && styles.segmentTextActive]}>
              아이디 찾기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, !isEmailMode && styles.segmentButtonActive]}
            onPress={() => switchMode('password')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentText, !isEmailMode && styles.segmentTextActive]}>
              비밀번호 찾기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: s(28) }}>
          <Input value={name} setValue={setName} placeholder="이름" />
          <View style={{ height: s(16) }} />
          {isEmailMode ? (
            <Input value={nickName} setValue={setNickName} placeholder="닉네임" />
          ) : (
            <Input
              value={email}
              setValue={setEmail}
              placeholder="이메일"
              keyboardType="email-address"
            />
          )}
        </View>

        {!!error && <Text style={[styles.errorText, { marginTop: s(10) }]}>{error}</Text>}

        <TouchableOpacity
          activeOpacity={isDisabled || loading ? 1 : 0.85}
          style={[
            styles.submitButton,
            isDisabled || loading ? styles.submitButtonDisabled : styles.submitButtonActive,
            { height: s(56), marginTop: s(28) },
          ]}
          onPress={isDisabled || loading ? undefined : handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{isEmailMode ? '아이디 찾기' : '임시 비밀번호 받기'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindAccount;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    color: '#8B8B8B',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#282828',
    fontSize: 24,
    fontWeight: '700',
  },
  segment: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#282828',
  },
  input: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E3E8',
    color: '#282828',
    fontSize: 15,
    fontWeight: '400',
  },
  errorText: {
    color: '#FF3D3D',
    fontSize: 12,
    fontWeight: '400',
  },
  submitButton: {
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#BB7CFF',
  },
  submitButtonDisabled: {
    backgroundColor: '#CACACA',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
