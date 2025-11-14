import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Record_Voice_Icon from '../../images/record_voice_icon'
import useScale from '../../hooks/useScale'
import CompleteBtn from '../../components/CompleteBtn'
import { SafeAreaView } from 'react-native-safe-area-context'

const RecordVoice = () => {
    const { s } = useScale();
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    
    const handleRecordVoice = () => {
        // 음성 녹음 로직 
        setIsVoiceRecording(prev => !prev);
    }
    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EBEBEB' }}>
            <View style={styles.container}>
            <View style={[styles.icon_wrapper, { marginTop: s(268), marginBottom: s(44) }]}>
  <View style={[styles.icon_glow, { width: s(180), height: s(180), borderRadius: s(90) }]} />
  <View style={[styles.icon_container, { width: s(140), height: s(140), borderRadius: s(70) }]}>
    <Record_Voice_Icon />
  </View>
</View>
                <Text style={styles.voice_record_text}>
                    {isVoiceRecording ? "꿈 이야기를 듣고 있어요" : "오늘은 어떤 꿈을 꾸었나요?"}
                </Text>
                <View style={[styles.button_container, {position: "absolute", left: s(16), right: s(16), bottom: s(23) }]}>
                    <CompleteBtn onPress={handleRecordVoice} title={isVoiceRecording? "녹음 종료" : "녹음 시작"}/>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default RecordVoice

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flex: 1,
        backgroundColor: '#EBEBEB',
        alignItems: "center"
    },
    // icon_container: {
    //     // width: 140,
    //     // height: 140,
    //     backgroundColor: "#BB7CFF",
    //     borderRadius: 70,
    //     // marginBottom: 44,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     shadowColor: '#BB7CFF',
    //     shadowOffset: { width: 0, height: 0 },
    //     shadowOpacity: 0.85,     
    //     shadowRadius: 28,        

    //     elevation: 55,           
    // },
    icon_wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      
      // 뒤에 깔리는 "빛 번짐" 레이어
      icon_glow: {
        position: 'absolute',
        backgroundColor: 'rgba(187, 124, 255, 0.35)', // 보라 + 투명
      },
      
      // 실제 버튼
      icon_container: {
        backgroundColor: '#BB7CFF',
        justifyContent: 'center',
        alignItems: 'center',
      
        // iOS용 살짝 입체감
        shadowColor: '#BB7CFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      
        // Android 입체감 (색은 안 먹음)
        elevation: 12,
      },      
    voice_record_text: {
        color: "#BB7CFF",
        fontSize: 24,
        fontFamily: "Roboto-Nomal",
        fontWeight: "700"
    },
    button_container: {
    }
})