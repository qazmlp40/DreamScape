import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Logo from '../components/Logo'
import Input from '../components/Input'
import CheckBtn from '../components/CheckBtn'
import CompleteBtn from '../components/CompleteBtn'
import Arrow from '../images/arrow'
import { useState } from 'react'

const BASE_URL = '나중에 받을 주소';

const Signup = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [ID, setID] = useState('');
  const [PW, setPW] = useState(''); 
  const [checkPW, setCheckPW] = useState('');
  const [termchecked, setTermchecked] = useState(false);

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState('');

  // 입력창 공백 상태
  const isDisabled = ID.trim() == '' || PW.trim() == '' || email.trim() == '' || checkPW.trim() == '' || termchecked == false; 

  const handleSignup = async () => {
    setPwError(false);
    setGlobalErr('');

    if (PW !== checkPW) {
    setPwError(true);
    setGlobalErr('비밀번호를 잘못 입력하였습니다');
    return;
    }

     // 2) 서버 요청
     try {
      const payload = {
        name: ID.trim(),                      // ← 백엔드 DTO: name
        email: email.trim().toLowerCase(),    // ← 백엔드 DTO: email
        password: PW                          // ← 백엔드 DTO: password
      };

      const res = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('회원가입 응답:', data);

      if (res.ok && data?.message?.includes('성공')) {
        // TODO: navigation.navigate('Login');  // 로그인 화면으로 이동 
      } else {
        setGlobalErr(data?.message || '회원가입에 실패했습니다.'); 
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setGlobalErr('서버에 연결할 수 없습니다.');
    }
  };
    
  
    return (
        <View style={styles.container}>
            <View style={styles.logo_container}>
                <Logo />
            </View>
            <View style={styles.input_container}>
                <Input value={username} setValue={setUserName} placeholder={'이름'} />
                <Input value={email} setValue={setEmail} placeholder={'이메일'} />
                <Input value={ID} setValue={setID} placeholder={'아이디'} />
                <Input value={PW} setValue={setPW} placeholder={'비밀번호'}  secureTextEntry error={pwError} />
                <Input value={checkPW} setValue={setCheckPW} placeholder={'비밀번호 확인'} secureTextEntry error={pwError} />
            </View>
            <View style={styles.error_text_container}>
              {!!globalErr && <Text style={styles.error_text}>{globalErr}</Text>} 
            </View>
            <View style={styles.terms_container}>
                <View style={styles.checkbox_container}>
                    <CheckBtn checked={termchecked} setChecked={setTermchecked}/>
                    <Text style={styles.terms_text}>회원가입 및 이용약관에 동의하겠습니까?</Text>
                </View>
            </View>
            <View style={styles.terms_detail_container}>
                <Text style={styles.detail_text}>이용약관 확인하기</Text>
                <Arrow />
            </View>
            <View style={styles.button_container}>
              <CompleteBtn onPress={handleSignup} disabled={isDisabled} />
            </View>
        </View>
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
        marginTop: 116,
        marginBottom: 32
      },
      input_container: {
        marginHorizontal: 32,
        gap: 16
      },
      terms_container: {
        marginHorizontal: 16,
        marginTop: 32
      },
      checkbox_container: {
        flexDirection: 'row',
        gap: 16,
        alignItems: "center"
      }, 
      terms_text: {
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        color: "#282828",
        textAlign: "left",
        fontWeight: 500
      },
      terms_detail_container: { 
        marginTop: 25,
        marginHorizontal: 36,
        paddingLeft: 36,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between"
      },
      detail_text: {
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        color: "#282828",
        textAlign: "left",
        fontWeight: 500
      },
      button_container: {
        position: 'absolute',
        bottom: 23, // 화면 하단에서 23px 위로 띄움
        left: 16,
        right: 16,
      },
      error_text_container: {
        marginHorizontal: 32
      },
      error_text: {
        marginTop: 8,
        color: "#FF3D3D",
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        textAlign: "left",
        fontWeight: 400
      }
})