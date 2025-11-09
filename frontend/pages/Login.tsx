import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useCallback } from 'react'
import Logo from '../images/logo'
import Input from '../components/Input'
import CompleteBtn from '../components/CompleteBtn'
import useLoginForm from '../hooks/useLoginForm';
import useScale from '../hooks/useScale'
import { SafeAreaView } from 'react-native-safe-area-context'

const BASE_URL = '나중에 받을 주소';

const Login = () => {
  const { s } = useScale();

  const navigation = useNavigation();

  const { userID, setUserID, userPW, setUserPW, reset } = useLoginForm();

  const [pwError, setPwError] = useState(false); 
  const [globalErr, setGlobalErr] = useState(''); 

  const isDisabled = userID.trim() == '' || userPW.trim() == '';

  const handleLogin = useCallback(async () => {
    setPwError(false);
    setGlobalErr('');
  
    if (isDisabled) {
      setPwError(true);
      setGlobalErr('아이디(로그인 전화번호, 로그인 전용 아이디) 또는 비밀번호가 잘못되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요.');
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userID.trim(), password: userPW }),
      });
      const data = await res.json();
  
      if (res.ok && data?.message?.includes('성공')) {
        // TODO: 홈 이동
      } else {
        setPwError(true);
        setGlobalErr(data?.message || '아이디(로그인 전화번호, 로그인 전용 아이디) 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (e) {
      setPwError(true);
      setGlobalErr('서버에 연결할 수 없습니다.');
    }
  }, [userID, userPW, isDisabled]); 


  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
      <View style={styles.container}>
        <View style={[styles.logo_container, {marginTop: s(116), marginBottom: s(32)} ] }> 
          <Logo/>
        </View>
        <View style={[styles.input_container, {marginTop: s(32), marginHorizontal: s(32)}]}>
          <Input value={userID} setValue={setUserID} placeholder='아이디'/>
          <View style={{ height: 32 }} />
          <Input value={userPW} setValue={setUserPW} placeholder='비밀번호' secureTextEntry error={pwError} />
          {!!globalErr && <Text style={[styles.error_text, {marginTop: s(8)}]}>{globalErr}</Text>}
        </View>
        <View style={[styles.link_container, {marginTop: s(16), marginHorizontal: s(32)}]}>
          <Text style={styles.link}>아이디, 비밀번호 찾기 |</Text>
          <TouchableOpacity onPress={()=>navigation.navigate('Signup')}>
            <Text style={styles.link}> 회원가입하기</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.button_container, {position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
          <CompleteBtn onPress={handleLogin} disabled={isDisabled} title={"완료"} />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  logo_container: {
    width: "100%",
    alignItems: "center",
    // marginTop: 116
    // marginBottom: 64
  },
  input_container: {
    // marginHorizontal: 32
  },
  link_container: {
    // marginHorizontal: 32,
    alignItems: "flex-end",
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginTop: 16
  },
  link: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#999",
    textAlign: "left",
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
    backgroundColor: "#999"
  },
  dividerText: {
    marginHorizontal: 16, 
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#474747",
    textAlign: "left",
    fontWeight: '400',
  },
  button_container: {
    // position: 'absolute',
    // bottom: 23, 
    // left: 16,
    // right: 16,
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