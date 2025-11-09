import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Left_Arrow from '../images/left_arrow'
import CompleteBtn from '../components/CompleteBtn'
import { useNavigation, useRoute } from '@react-navigation/native'
import useScale from '../hooks/useScale'
import { SafeAreaView } from 'react-native-safe-area-context'

const Terms = () => {
    const { s } = useScale(); 

    const navigation = useNavigation();
    const route = useRoute();

    const handleConfirm = () => {
        console.log('[Terms] confirm pressed');            
        const onAccept = (route.params as any)?.onAccept;
        console.log('[Terms] has onAccept?', !!onAccept);  
        onAccept?.();
        navigation.goBack();
      };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
      <View style={[styles.header, {paddingBottom: s(16), paddingTop: s(44), paddingLeft:s(10)}]}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
            <Left_Arrow/>
        </TouchableOpacity>
        <Text style={styles.title}> 약관 동의 </Text>
      </View>
      <View style={[styles.content_container, {paddingVertical: s(10), paddingHorizontal:s(16), top: s(40)}]}>
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
        <View style={[styles.button_container, {position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
            <CompleteBtn title={"확인"} onPress={handleConfirm} />
        </View>
    </SafeAreaView>
  )
}

export default Terms

const styles = StyleSheet.create({
    header: {
        // paddingBottom: 16,
        // paddingTop: 44,
        // paddingLeft: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    title: {
        fontSize: 18,
        fontFamily: "Roboto-Bold",
        color: "#282828",
        textAlign: "left",
        fontWeight: '700'
    },
    content_container: {
        justifyContent: "space-between",
        // paddingVertical: 10,
        // paddingHorizontal: 16,
        // top: 40
    },
    content: {
        fontSize: 14,
        fontFamily: "Roboto-Medium",
        color: "#000000",
        textAlign: "left",
        fontWeight: '500'
    },
    button_container: {
        // position: 'absolute',
        // bottom: 23, 
        // left: 16,
        // right: 16,
    }
})