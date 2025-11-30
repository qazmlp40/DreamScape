// 프로필 페이지
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useScale from '../../hooks/useScale'
import Delete_Account_Icon from '../../images/Profile/delete_account_icon'
import Inquiry_Icon from '../../images/Profile/inquiry_icon'
import Logout_Icon from '../../images/Profile/logout_icon'
import Profile_Icon from '../../images/Profile/profile_icon'
import Profile_Menu_Btn from '../../components/Profile/Profile_Menu_Btn'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import CompleteBtn from '../../components/CompleteBtn'
import Profile_CancleBtn from '../../components/Profile/Profile_CancleBtn'

const BASE_URL = 'http://10.0.2.2:8080';

const Profile = () => {
  const navigation = useNavigation();

  const [isLogoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [isWithdrawPopupVisible, setWithdrawPopupVisible] = useState(false);

  const showLogoutPopup = () => {
    setLogoutPopupVisible(true);
  }
  const showWithdrawPopup = () => {
    setWithdrawPopupVisible(true);
  }
  
  const handleLogout = () => {
    // 로그아웃 로직
    // navigation.navigate('Login');
  }

  const handleWithdraw = () => {
    // 회원 탈퇴 로직
    // navigation.navigate('Login');
  }

  const { s } = useScale();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }} >
      <View style={styles.container}>
          <View style={[styles.menu_container, {marginTop: s(44)}]}>
            <Profile_Menu_Btn label={'프로필 설정'} icon={<Profile_Icon/>} onPress={()=> navigation.navigate('Profile_Setting')} />
            <Profile_Menu_Btn label={'문의하기'} icon={<Inquiry_Icon/>} onPress={()=> navigation.navigate('Profile_Inquiry')}/>
            <Profile_Menu_Btn label={'로그아웃'} icon={<Logout_Icon/>} onPress={showLogoutPopup}/>
            <Profile_Menu_Btn label={'계정 탈퇴'} icon={<Delete_Account_Icon/>} onPress={showWithdrawPopup} />
          </View>
          <View style={[styles.footer, {height: s(72), position: "absolute", left: s(0), right: s(0), bottom: s(0)}]}>
             <Text> 하단바 들어갈 자리 . . .</Text>
          </View>
      </View>
      {/* 로그아웃 팝업 */}
      {isLogoutPopupVisible && (
          <View style={styles.popup_overlay}>
              <View style={[styles.popup_box, {width: s(348), height: s(160)}]}>
                  <View style={[styles.text_box, {marginTop: s(32)}]}>
                      <Text style={styles.text1}>'로그아웃' 하시겠습니까?</Text>
                  </View>
                  <View style={[styles.btn_container, {width: s(152), position: "absolute", bottom: s(10)}]}>
                      <CompleteBtn title={"로그아웃"} onPress={handleLogout}/>
                      <Profile_CancleBtn title={"취소"} onPress={() => {setLogoutPopupVisible(false)}}/>
                  </View>
              </View>
          </View>
      )}
      {/* 회원탈퇴 팝업 */}
      {isWithdrawPopupVisible && (
        <View style={styles.popup_overlay}>
            <View style={[styles.popup_box, {width: s(348), height: s(160)}]}>
                <View style={[styles.text_box, {marginTop: s(20)}]}>
                    <Text style={styles.text1}>'계정탈퇴' 하시겠습니까?</Text>
                    <Text style={styles.text2}>탈퇴시, 이전 내용은 복구되지 않습니다!</Text>
                </View>
                <View style={[styles.btn_container, {width: s(152), position: "absolute", bottom: s(10)}]}>
                    <CompleteBtn title={"탈퇴하기"} onPress={handleWithdraw}/>
                    <Profile_CancleBtn title={"취소"} onPress={() => {setWithdrawPopupVisible(false)}}/>
                </View>
            </View>
        </View>
    )}
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1
  },
  menu_container: {
    width: '100%',
    alignItems: "center",
    gap: 16
  },
  footer: {
    width: "100%",
    backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center"
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
},
btn_container: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "center",
  gap: 10
}
})