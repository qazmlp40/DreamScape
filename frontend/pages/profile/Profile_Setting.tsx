// 프로필 설정 페이지

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Back_Btn from '../../images/Profile/back_btn'
import { useNavigation } from '@react-navigation/native'
import Profile_input from '../../components/Profile/Profile_input'
import { useState } from 'react'
import useScale from '../../hooks/useScale'
import CompleteBtn from '../../components/CompleteBtn'

const Profile_Setting = () => {
    const { s } = useScale();
    const navigation = useNavigation();

    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPW] = useState('');
    const [pwCheck, setPWCheck] = useState('');

    const handleUpdate = () => {
        // TODO : 나중에 수정 로직 추가
        navigation.navigate("Profile");
    }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
        <View style={[styles.header_container, {height: s(64), paddingHorizontal: s(4), marginBottom: s(48)}]}>
            <View>
                <TouchableOpacity style={{zIndex: 1}} onPress={() => navigation.goBack()}>
                    <Back_Btn />
                </TouchableOpacity>
            </View>
            <Text style={styles.header_text} >프로필</Text>
        </View>
        <View style={[styles.input_container, {marginHorizontal:s(16)}]}>
            <Profile_input 
                placeholder={"닉네임"} 
                value={nickname}
                setValue={setNickname}
            />
            <Profile_input
                placeholder={"이메일"}
                value={email}
                setValue={setEmail}/>
            <Profile_input
                placeholder={"비밀번호 변경"}
                value={pw}
                setValue={setPW}/>
            <Profile_input
                placeholder={"비밀번호 확인"}
                value={pwCheck}
                setValue={setPWCheck}
            />
        </View>
        <View style={[{position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
            <CompleteBtn title={"완료"} onPress={handleUpdate}/>
        </View>
    </SafeAreaView>
  )
}

export default Profile_Setting

const styles = StyleSheet.create({
    header_container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative'
    },
    header_text: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',      
        fontSize: 22,
        fontFamily: "Roboto-Nomal",
        color: "#2E2E34",
        fontWeight: '400',
        zIndex: -1
    },
    input_container: {
        width: '100%',
        gap: 20
    }
})