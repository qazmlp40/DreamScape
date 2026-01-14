// Profile.tsx (아이콘 + 버튼 + useScale 완전 통합 버전)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const BASE_URL = 'http://10.0.2.2:8080';

/* ------------------ useScale 훅 (통합) ------------------ */

const BASE_WIDTH = 412; // 피그마 화면의 넓이

function useScale() {
  const width = useWindowDimensions().width; // 현재 기기의 화면 넓이
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

/* ------------------ 공통 버튼 타입 ------------------ */

interface ButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
}

/* ------------------ CompleteBtn 컴포넌트 (통합) ------------------ */

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

/* ------------------ Profile_CancleBtn 컴포넌트 (통합) ------------------ */

const Profile_CancleBtn = ({ onPress, disabled = false, title }: ButtonProps) => {
  const { s } = useScale();

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      style={[
        cancelBtnStyles.button,
        disabled ? cancelBtnStyles.button_disabled : cancelBtnStyles.button_active,
        { height: s(60) },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <Text style={cancelBtnStyles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const cancelBtnStyles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BB7CFF',
  },
  button_active: {
    backgroundColor: '#FFF',
  },
  button_disabled: {
    backgroundColor: '#CACACA',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#BB7CFF',
    textAlign: 'center',
    fontWeight: '700',
  },
});

/* ------------------ Profile_Menu_Btn 컴포넌트 (통합) ------------------ */

type ProfileMenuBtnProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

const Profile_Menu_Btn = ({ icon, label, onPress }: ProfileMenuBtnProps) => {
  const { s } = useScale();

  return (
    <View>
      <TouchableOpacity
        style={[
          profileMenuBtnStyles.btn,
          { width: s(380), height: s(56), padding: s(16) },
        ]}
        onPress={onPress}
      >
        <View>{icon}</View>
        <Text style={[profileMenuBtnStyles.label, { fontSize: s(14) }]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const profileMenuBtnStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFF',

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 5,

    // Android Shadow
    elevation: 5,
  },
  label: {
    color: '#282828',
    fontFamily: 'Roboto-Nomal',
    fontWeight: '400',
  },
});

/* ------------------ 아이콘 컴포넌트들 (통합) ------------------ */

const Delete_Account_Icon = () => {
  const { s } = useScale();
  const W = 20,
    H = 20;

  return (
    <Svg
      width={s(W)}
      height={s(H)}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0ZM1.5 10C1.49028 6.61789 3.4912 3.5534 6.5916 2.202C9.69199 0.850603 13.299 1.47073 15.77 3.78L3.77 15.78C2.30543 14.2124 1.49363 12.1453 1.5 10ZM4.9 16.78C6.36674 17.8945 8.15785 18.4986 10 18.5C13.2228 18.5077 16.1714 16.6878 17.6093 13.8035C19.0472 10.9192 18.7259 7.4691 16.78 4.9L4.9 16.78Z"
        fill="#BB7CFF"
      />
    </Svg>
  );
};

const Inquiry_Icon = () => {
  const { s } = useScale();
  const W = 24,
    H = 24;

  return (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.07 10.24H18.86C19.1361 10.24 19.36 10.4638 19.36 10.74V17.66C19.36 19.8691 17.5691 21.66 15.36 21.66H8.45996C6.25082 21.66 4.45996 19.8691 4.45996 17.66V6.49997C4.45996 4.29083 6.25082 2.49997 8.45996 2.49997H11.13C11.4061 2.49997 11.63 2.72383 11.63 2.99997V7.77997C11.6273 8.42975 11.8829 9.05398 12.3405 9.51532C12.7981 9.97666 13.4202 10.2373 14.07 10.24ZM8.05996 10.74C7.50768 10.74 7.05996 11.1877 7.05996 11.74L7.06996 13.13C7.06996 13.6823 7.51768 14.13 8.06996 14.13H9.45996C10.0122 14.13 10.46 13.6823 10.46 13.13V11.74C10.46 11.1877 10.0122 10.74 9.45996 10.74H8.05996ZM7.80996 15.18H12.24C12.6542 15.18 12.99 15.5158 12.99 15.93C12.99 16.3442 12.6542 16.68 12.24 16.68H7.80996C7.39575 16.68 7.05996 16.3442 7.05996 15.93C7.05996 15.5158 7.39575 15.18 7.80996 15.18ZM7.80996 19.18H13.71C14.1242 19.18 14.46 18.8442 14.46 18.43C14.46 18.0158 14.1242 17.68 13.71 17.68H7.80996C7.39575 17.68 7.05996 18.0158 7.05996 18.43C7.05996 18.8442 7.39575 19.18 7.80996 19.18Z"
      fill="#BB7CFF"
    />
    <Path
      d="M12.68 3.07997V7.64997C12.68 8.47287 13.3471 9.13997 14.17 9.13997H18.79C19.0444 9.17877 19.2918 9.0359 19.3853 8.7961C19.4788 8.55629 19.3935 8.28369 19.18 8.13997L13.63 2.63997C13.4637 2.47745 13.2142 2.43461 13.0032 2.53234C12.7922 2.63007 12.6636 2.84802 12.68 3.07997Z"
      fill="#945ECD"
    />
  </Svg>
  );
};

const Logout_Icon = () => {
  const { s } = useScale();
  const W = 14,
    H = 19;

  return (
    <Svg
      width={s(W)}
      height={s(H)}
      viewBox="0 0 14 19"
      fill="none"
    >
      <Path
        d="M7.6911 0.290793L13.6853 6.12079C14.0926 6.50253 14.1063 7.13255 13.7161 7.53079C13.5231 7.72011 13.2603 7.82659 12.9861 7.82659C12.712 7.82659 12.4492 7.72011 12.2561 7.53079L7.98927 3.41079V14.0408C7.98927 14.5931 7.52894 15.0408 6.96111 15.0408C6.39327 15.0408 5.93295 14.5931 5.93295 14.0408V3.41079L1.69694 7.53079C1.289 7.87057 0.680915 7.84772 0.301145 7.47836C-0.0786254 7.10899 -0.102113 6.51755 0.247231 6.12079L6.2414 0.290793C6.64242 -0.0969309 7.29008 -0.0969309 7.6911 0.290793Z"
        fill="#BB7CFF"
      />
      <Path
        d="M1.82031 16.0408H12.1019C12.6697 16.0408 13.1301 16.4885 13.1301 17.0408C13.1301 17.5931 12.6697 18.0408 12.1019 18.0408H1.82031C1.25248 18.0408 0.792153 17.5931 0.792153 17.0408C0.792153 16.4885 1.25248 16.0408 1.82031 16.0408Z"
        fill="#945ECD"
      />
    </Svg>
  );
};


const Profile_Icon = () => {
  const { s } = useScale();
  const W = 24,
    H = 24;

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.6396 22H7.35961C6.34878 21.9633 5.40717 21.477 4.79195 20.6742C4.17673 19.8713 3.95217 18.8356 4.17961 17.85L4.41961 16.71C4.69564 15.1668 6.02223 14.0327 7.58961 14H16.4096C17.977 14.0327 19.3036 15.1668 19.5796 16.71L19.8196 17.85C20.047 18.8356 19.8225 19.8713 19.2073 20.6742C18.592 21.477 17.6504 21.9633 16.6396 22Z"
        fill="#BB7CFF"
      />
      <Path
        d="M12.4996 12H11.4996C9.29047 12 7.49961 10.2092 7.49961 8.00001V5.36001C7.49694 4.46807 7.85008 3.61189 8.48078 2.98119C9.11148 2.35049 9.96766 1.99735 10.8596 2.00001H13.1396C14.0315 1.99735 14.8877 2.35049 15.5184 2.98119C16.1491 3.61189 16.5023 4.46807 16.4996 5.36001V8.00001C16.4996 9.06088 16.0782 10.0783 15.328 10.8284C14.5779 11.5786 13.5605 12 12.4996 12Z"
        fill="#BB7CFF"
      />
    </Svg>
  );
};

/* ------------------ Profile 메인 컴포넌트 ------------------ */

const Profile = () => {
  const [isLogoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [isWithdrawPopupVisible, setWithdrawPopupVisible] = useState(false);

  const showLogoutPopup = () => {
    setLogoutPopupVisible(true);
  };

  const showWithdrawPopup = () => {
    setWithdrawPopupVisible(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userId');
      setLogoutPopupVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('로그아웃 처리 오류:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '회원 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
        return;
      }

      const res = await fetch(`${BASE_URL}/t_user/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.error('회원탈퇴 요청 실패:', res.status);
        return;
      }

      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userId');
      setWithdrawPopupVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('회원탈퇴 처리 중 오류:', error);
    }
  };

  const { s } = useScale();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={[styles.menu_container, { marginTop: s(44) }]}>
          <Profile_Menu_Btn
            label={'프로필 설정'}
            icon={<Profile_Icon />}
            onPress={() => {router.push('/setting')}}
          />
          <Profile_Menu_Btn
            label={'문의하기'}
            icon={<Inquiry_Icon />}
            onPress={() => {router.push('/inquiry')}}
          />
          <Profile_Menu_Btn
            label={' 로그아웃'}
            icon={<Logout_Icon />}
            onPress={showLogoutPopup}
          />
          <Profile_Menu_Btn
            label={' 계정 탈퇴'}
            icon={<Delete_Account_Icon />}
            onPress={showWithdrawPopup}
          />
        </View>
      </View>

      {/* 로그아웃 팝업 */}
      {isLogoutPopupVisible && (
        <View style={styles.popup_overlay}>
          <View style={[styles.popup_box, { width: s(348), height: s(160) }]}>
            <View style={[styles.text_box, { marginTop: s(32) }]}>
              <Text style={styles.text1}>'로그아웃' 하시겠습니까?</Text>
            </View>
            <View
              style={[
                styles.btn_container,
                { width: s(152), position: 'absolute', bottom: s(10) },
              ]}
            >
              <CompleteBtn title={'로그아웃'} onPress={handleLogout} />
              <Profile_CancleBtn
                title={'취소'}
                onPress={() => {
                  setLogoutPopupVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* 회원탈퇴 팝업 */}
      {isWithdrawPopupVisible && (
        <View style={styles.popup_overlay}>
          <View style={[styles.popup_box, { width: s(348), height: s(160) }]}>
            <View style={[styles.text_box, { marginTop: s(20) }]}>
              <Text style={styles.text1}>'계정탈퇴' 하시겠습니까?</Text>
              <Text style={styles.text2}>탈퇴시, 이전 내용은 복구되지 않습니다!</Text>
            </View>
            <View
              style={[
                styles.btn_container,
                { width: s(152), position: 'absolute', bottom: s(10) },
              ]}
            >
              <CompleteBtn title={'탈퇴하기'} onPress={() => router.replace('/(auth)/login')} />
              <Profile_CancleBtn
                title={'취소'}
                onPress={() => {
                  setWithdrawPopupVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;

/* ------------------ Profile 전용 스타일 ------------------ */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  menu_container: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  footer: {
    width: '100%',
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup_overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup_box: {
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
  },
  text_box: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text1: {
    fontFamily: 'Roboto-Regular',
    fontSize: 20,
    textAlign: 'center',
    color: '#232527',
    fontWeight: '700',
  },
  text2: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    textAlign: 'center',
    color: '#808991',
    fontWeight: '500',
  },
  btn_container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
});