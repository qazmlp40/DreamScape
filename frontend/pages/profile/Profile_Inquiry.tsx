// 문의하기 페이지 

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useScale from '../../hooks/useScale'
import Back_Btn from '../../images/Profile/back_btn'
import { useNavigation } from '@react-navigation/native'
import Profile_input from '../../components/Profile/Profile_input'
import { useState } from 'react'
import CompleteBtn from '../../components/CompleteBtn'

const Profile_Inquiry = () => {
    const { s } = useScale();
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleSend = () => {
        // TODO: 나중에 여기서 실제 전송 로직 추가
        setIsPopupVisible(true);
      };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
        <View style={[styles.header_container, {height: s(64), paddingHorizontal: s(4), marginBottom: s(48)}]}>
            <View>
                <TouchableOpacity style={{zIndex: 1}} onPress={() => navigation.goBack()}>
                    <Back_Btn />
                </TouchableOpacity>
            </View>
            <Text style={styles.header_text}>문의하기</Text>
        </View>
        <View style={[styles.input_container, {marginHorizontal:s(16)}]} >
            <Profile_input 
                placeholder={"제목"}
                value={title}
                setValue={setTitle}
            />
            <View>
                <Profile_input
                    placeholder={"문의 내용"}
                    value={content}
                    setValue={setContent}
                    multiline
                    style={{ height: s(308), textAlignVertical: 'top' }}
                />
            </View>
        </View>
        <View style={[{position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
            <CompleteBtn title={"전송"} onPress={handleSend}/>
        </View>
        {isPopupVisible && (
            <View style={styles.popup_overlay}>
                <View style={[styles.popup_box, {width: s(348), height: s(160)}]}>
                    <View style={[styles.text_box, {marginTop: s(20)}]}>
                        <Text style={styles.text1}>문의 전송이 성공하였습니다!</Text>
                        <Text style={styles.text2}>소중한 의견 감사합니다.</Text>
                    </View>
                    <View style={{width: s(152), position: 'absolute', bottom: s(10)}}>
                        <CompleteBtn title={"확인"} onPress={()=>{navigation.navigate('Profile')}}/>
                    </View>
                </View>
            </View>
        )}
    </SafeAreaView>
  )
}

export default Profile_Inquiry

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
        fontFamily: "Roboto-Medium",
        color: "#2E2E34",
        fontWeight: '400',
        zIndex: -1
    },
    input_container: {
        gap: 32
    },
    popup_overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup_box: {
        backgroundColor: "#fff",
        borderRadius: 15,
        alignItems: "center"
    },
    text_box: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    text1: {
        fontFamily: "Roboto-Regular",
        fontSize: 20,
        textAlign: "center",
        color: "#232527",
        fontWeight: '700'
    },
    text2: {
        fontFamily: "Roboto-Medium",
        fontSize: 14,
        textAlign: "center",
        color: "#808991",
        fontWeight: 500
    }
})