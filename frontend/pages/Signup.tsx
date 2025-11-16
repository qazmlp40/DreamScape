import { StyleSheet, Text, View, TouchableOpacity, Keyboard } from 'react-native'
import Logo from '../images/logo'
import Input from '../components/Input'
import CheckBtn from '../components/CheckBtn'
import CompleteBtn from '../components/CompleteBtn'
import Right_Arrow from '../images/right_arrow'
import React,{ useState, useEffect, useCallback } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import useSignupForm from '../hooks/useSignupForm'
import useScale from '../hooks/useScale'
import { SafeAreaView } from 'react-native-safe-area-context'

const BASE_URL = 'http://10.0.2.2:8080';

const Signup = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { username, setUsername, email, setEmail, ID, setID, PW, setPW, checkPW, setCheckPW } = useSignupForm();

  const [termChecked, setTermChecked] = useState(false);

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState('');

  const { s } = useScale();

  // 스크롤 활성화 여부 (키보드 올라올 때만 true)
  const [scrollEnabled, setScrollEnabled] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setScrollEnabled(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setScrollEnabled(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 입력창 공백 상태
  const isDisabled = ID.trim() == '' || PW.trim() == '' || email.trim() == '' || checkPW.trim() == '' || termChecked == false; 

  const toggleTerms = useCallback(() => {
    setTermChecked(prev => !prev);
  }, []);
  
  const handleSignup = useCallback(async () => {
    setGlobalErr('');
    setPwError(false);
  
    const disabled =
      !termChecked ||
      username.trim() === '' ||      
      email.trim() === '' ||
      ID.trim() === '' ||            
      PW.trim() === '' ||
      checkPW.trim() === '';
  
    if (PW !== checkPW) {
      setPwError(true);
      setGlobalErr('비밀번호를 잘못 입력하였습니다');
      return;
    }
    if (disabled) {
      setGlobalErr('입력값을 확인하고 약관에 동의해 주세요.');
      return;
    }
  
    try {
      const payload = {
        userNickName: ID.trim(), // 아이디           
        name: username.trim(), // 이름  
        email: email.trim().toLowerCase(),
        password: PW,
        profileImage: "https://picsum.photos/200/200", // 기본 프로필 이미지
        socialProvider: "local" // 기본 가입 방식
      };

    console.log("요청 payload:", payload);
      
    const res = await fetch(`${BASE_URL}/t_user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const text = await res.text();
    console.log('응답 상태:', res.status);
    console.log('응답 텍스트:', text);
    
    let data: { message?: string } = {};

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('JSON 파싱 실패:', text);
    }
  
      if (!res.ok) {
        setGlobalErr(data?.message || '회원가입에 실패했습니다.');
        return;
      }

      if (res.ok) {
        console.log("회원가입 성공");
        navigation.navigate('Login');
        return;
      }
  
      setGlobalErr(data?.message || '회원가입에 실패했습니다.');
    } catch (e) {
      setGlobalErr('서버에 연결할 수 없습니다.');
    }
  }, [termChecked, username, email, ID, PW, checkPW]);
  
    
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
        <View style={styles.container}>
          <KeyboardAwareScrollView 
            style={styles.scroll}
            scrollEnabled={scrollEnabled}  
            enableOnAndroid={true}
            extraScrollHeight={20}
          >
            <View style={[styles.logo_container, {marginTop: s(68), marginBottom: s(32)}]}>
                <Logo />
            </View>
            <View style={[styles.input_container, {marginHorizontal: s(32)}]}>
                <Input value={username} setValue={setUsername} placeholder={'이름'} />
                <View style={{ height: s(16) }} />
                <Input value={email} setValue={setEmail} placeholder={'이메일'} />
                <View style={{ height: s(16) }} />
                <Input value={ID} setValue={setID} placeholder={'아이디'} />
                <View style={{ height: s(16) }} />
                <Input value={PW} setValue={setPW} placeholder={'비밀번호'}  secureTextEntry error={pwError} />
                <View style={{ height: s(16) }} />
                <Input value={checkPW} setValue={setCheckPW} placeholder={'비밀번호 확인'} secureTextEntry error={pwError} />
            </View>
            <View style={[styles.error_text_container, {marginHorizontal: s(32)}]}>
              {!!globalErr && <Text style={[styles.error_text, {marginTop: s(8)}]}>{globalErr}</Text>} 
            </View>
            <View style={[styles.terms_container, {marginHorizontal: s(16), marginTop: s(32)}]}>
                <View style={styles.checkbox_container}>
                    <CheckBtn checked={termChecked} setChecked={toggleTerms} />
                    <Text style={[styles.terms_text, {marginLeft: s(16)} ]}>회원가입 및 이용약관에 동의하겠습니까?</Text>
                </View>
            </View>
            <View style={[styles.terms_detail_container, {marginTop: s(30), marginHorizontal: s(36), paddingLeft: s(36)}]}>
                <Text style={styles.detail_text}>이용약관 확인하기</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Terms', {
                      onAccept: () => {
                        console.log('[Signup] onAccept fired'); 
                        setTermChecked(true);
                      },
                    } as any)
                  }
                >
                  <Right_Arrow />
                </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
            <View style={[styles.button_container, {position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
              <CompleteBtn onPress={handleSignup} disabled={isDisabled} title={"완료"} />
            </View>
        </View>
      </SafeAreaView>
    )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flex: 1,
        backgroundColor: "#fff",
      },
      logo_container: {
        width: "100%",
        alignItems: "center",
        // marginTop: 68
      },
      input_container: {
        // marginHorizontal: 32,
        // gap: 16
      },
      terms_container: {
        // marginHorizontal: 16,
        // marginTop: 32
      },
      checkbox_container: {
        flexDirection: 'row',
        // gap: 16,
        alignItems: "center"
      }, 
      terms_text: {
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        color: "#282828",
        textAlign: "left",
        fontWeight: '500'
      },
      terms_detail_container: { 
        // marginTop: 30,
        // marginHorizontal: 36,
        // paddingLeft: 36,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between"
      },
      detail_text: {
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        color: "#282828",
        textAlign: "left",
        fontWeight: '500'
      },
      button_container: {
        // position: 'absolute',
        // bottom: 23, 
        // left: 16,
        // right: 16,
      },
      error_text_container: {
        // marginHorizontal: 32
      },
      error_text: {
        // marginTop: 8,
        color: "#FF3D3D",
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        textAlign: "left",
        fontWeight: '400'
      }
})