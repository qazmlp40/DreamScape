import { useNavigation, useRoute } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

/* ---------------------------------------------------
  📌 useScale (병합)
--------------------------------------------------- */
const BASE_WIDTH = 412;
function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

/* ---------------------------------------------------
  📌 Left_Arrow (병합)
--------------------------------------------------- */
const Left_Arrow: React.FC = () => {
  const { s } = useScale();
  const W = 17;
  const H = 16;
  return (
    <Svg
      width={s(W)}
      height={s(H)}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path d="M7.21934 15.2793C7.36263 15.4146 7.55231 15.4897 7.74934 15.4893C7.94563 15.491 8.13387 15.4114 8.26934 15.2693C8.41229 15.1301 8.49291 14.9389 8.49291 14.7393C8.49291 14.5398 8.41229 14.3486 8.26934 14.2093L2.56928 8.50928H15.7896C16.2038 8.50928 16.5396 8.17349 16.5396 7.75928C16.5396 7.34506 16.2038 7.00928 15.7896 7.00928H2.56709L8.27934 1.27934C8.42229 1.14005 8.50291 0.948928 8.50291 0.74934C8.50291 0.549753 8.42229 0.358628 8.27934 0.21934C7.98652 -0.0731134 7.51216 -0.0731134 7.21934 0.21934L0.21934 7.21934C-0.0731134 7.51216 -0.0731134 7.98652 0.21934 8.27934L7.21934 15.2793Z" fill="#282828" />
    </Svg>
  );
};


/* ---------------------------------------------------
  📌 CompleteBtn (병합)
--------------------------------------------------- */
type CompleteBtnProps = {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
};

const CompleteBtn: React.FC<CompleteBtnProps> = ({
  onPress,
  disabled = false,
  title,
}) => {
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

/* ---------------------------------------------------
  📌 Terms 페이지 본체
--------------------------------------------------- */
const Terms: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { s } = useScale();

  const handleConfirm = () => {
    router.replace({
      pathname: '/(auth)/signup',
      params: { acceptedTerms: '1' },
    });
  };

  return (
    <>
    <Stack.Screen options={{headerShown: false}} />

      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={[
          styles.header,
          {
            paddingBottom: s(16),
            paddingTop: s(44),
            paddingLeft: s(10),
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Left_Arrow />
        </TouchableOpacity>
        <Text style={styles.title}> 약관 동의 </Text>
      </View>

      <View
        style={[
          styles.content_container,
          {
            paddingVertical: s(10),
            paddingHorizontal: s(16),
            top: s(40),
          },
        ]}
      >
        <Text style={styles.content}>
          {`개인정보 수집 항목 회사는 회원가입, 서비스 신청을 위해 아래와 같은 개인정보를 수집하고 있습니다. 

      *수집항목: 아이디, 비밀번호

      *개인정보 수집방법: 앱 설치 후 회원가입 메뉴를 통해서 가입

      ■ 개인정보 수집 및 이용목적 회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.

      1) 회원 서비스에 이용에 따른 본인 확인 절차에 이용
                
      ■ 개인정보 수집에 대한 동의 회사는 회원님의 개인정보 수집에 대하여 동의를 받고 있으며, 회원가입시 이용약관 및 개인정보취급방침에 개인정보 수집 동의절차를 마련해 두고 있습니다.

      회원님께서 ‘회원가입 및 이용약관에 동의하겠습니까’란에 체크하시면 개인정보 수집에 대해 동의한 것으로 봅니다.

      가입 후 , 설정 메뉴에서도 이용약관 및 개인정보 취급방침 내용을 다시 확인할 수 있습니다.`}
        </Text>
      </View>

      <View
        style={[
          styles.button_container,
          { position: 'absolute', left: s(16), right: s(16), bottom: s(23) },
        ]}
      >
        <CompleteBtn title="확인" onPress={handleConfirm} />
      </View>
      </SafeAreaView>
    </>
  );
};

export default Terms;

/* ---------------------------------------------------
  📌 Styles
--------------------------------------------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 16, // RN 타입 때문에 빨간 줄이면 이 줄은 주석 처리해도 됨
  },
  title: {
    marginLeft: 16,
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#282828',
    fontWeight: '700',
  },
  content_container: {
    justifyContent: 'space-between',
  },
  content: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#000',
    fontWeight: '500',
  },
  circle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  off: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#282828',
  },
  on: {
    backgroundColor: '#BB7CFF',
    borderColor: '#BB7CFF',
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
  button_text: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#FFF',
    fontWeight: '700',
  },
  button_container: {},
});
