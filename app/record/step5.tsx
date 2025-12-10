import { Stack, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const colors = {
text: '#1F2937',
background: '#FFFFFF',
cardBackground: '#F3F4F6',
border: '#E5E7EB',
buttonColor: '#BB7CFF',
purple: '#BB7CFF',
purpleLight: '#F3E8FF',
inactive: '#9CA3AF',
};

const screenWidth = Dimensions.get('window').width;
const FIXED_BUTTON_HEIGHT = 56;

export default function RecordStep5Screen() {

const router = useRouter();
const insets = useSafeAreaInsets();
const BOTTOM_INSET = insets.bottom || 20;
const [dreamSummary, setDreamSummary] = useState('');
const [isSaved, setIsSaved] = useState(false);
const viewRef = useRef(null);

const handleSave = () => {
setIsSaved(true);
};

const handleNext = () => {
router.push('/(tabs)' as any);
};

const handleClose = () => {
setIsSaved(false);
};

const handleSaveImage = async () => {
try {
const { status } = await MediaLibrary.requestPermissionsAsync();
if (status !== 'granted') {
Alert.alert('권한 필요', '이미지를 저장하려면 갤러리 접근 권한이 필요합니다.');
return;
}

setIsSaved(false);

const uri = await captureRef(viewRef, {
format: 'png',
quality: 1,
});

await MediaLibrary.saveToLibraryAsync(uri);
Alert.alert('저장 완료', '이미지가 갤러리에 저장되었습니다.');
} catch (error) {
Alert.alert('오류', '이미지 저장에 실패했습니다.');
console.error(error);
}
};

return (
<>
<Stack.Screen options={{ headerShown: false }} />
<SafeAreaView style={styles.container} ref={viewRef} collapsable={false}>
{/* Header */}
<View style={styles.header}>
<View />
<Pressable onPress={handleSave}>
<Text style={styles.saveText}>저장하기</Text>
</Pressable>
</View>

    {/* Title */}
    <View style={styles.titleContainer}>
      <Text style={styles.title}>꿈 제목</Text>
    </View>

    {/* Main Content */}
    <View style={styles.content}>
      {/* Character Image */}
      <View style={styles.characterBox}>
        <Text style={styles.characterText}>꿈 상징 캐릭터</Text>
      </View>

      {/* Dream Summary Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="꿈 일기 요약 내용"
          value={dreamSummary}
          onChangeText={setDreamSummary}
          multiline
        />
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {/* Public Option */}
        <View style={styles.publicOption}>
          <View style={styles.optionIcon} />
          <View>
            <Text style={styles.optionTitle}>꿈 내용</Text>
            <Text style={styles.optionSubtitle}>꿈 해설</Text>
          </View>
        </View>

        {/* Private Option */}
        <View style={styles.privateOption}>
          <View style={styles.optionIcon} />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>꿈 내용</Text>
            <Text style={styles.optionDescription}>
              꿈 해설
            </Text>
          </View>
        </View>
      </View>

    </View>

    {/* Next Button */}
    <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}>
      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>다음</Text>
      </Pressable>
    </View>

    {/* Save Modal */}
    <Modal visible={isSaved} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>이미지로 저장하시겠습니까?</Text>
          <Text style={styles.modalSubtitle}>현재 화면을 이미지로 저장할 수 있습니다.</Text>
          
          <View style={styles.modalButtons}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
            <Pressable style={styles.saveImageButton} onPress={handleSaveImage}>
              <Text style={styles.saveImageButtonText}>이미지 저장</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </SafeAreaView>
</>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: 16,
paddingVertical: 8,
},
saveText: {
fontSize: 18,
fontWeight: '700',
color: '#282828',
letterSpacing: -0.36,
},
titleContainer: {
alignItems: 'center',
paddingVertical: 0,
marginTop: -16,
},
title: {
fontSize: 20,
fontWeight: 'bold',
color: colors.text,
},
content: {
flex: 1,
paddingHorizontal: 16,
paddingTop: 0,
paddingBottom: 24,
},
characterBox: {
width: 200,
height: 200,
backgroundColor: '#B6B6B6',
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
marginBottom: 16,
marginTop: -16,
alignSelf: 'center',
},
characterText: {
fontSize: 14,
color: colors.background,
},
inputContainer: {
backgroundColor: '#FFFFFF',
borderRadius: 16,
borderWidth: 1,
borderColor: colors.border,
padding: 16,
marginBottom: 16,
alignSelf: 'stretch',
justifyContent: 'center',
alignItems: 'center',
},
input: {
fontSize: 14,
color: colors.text,
minHeight: 40,
},
optionsContainer: {
marginBottom: 100,
},
publicOption: {
backgroundColor: colors.purpleLight,
borderRadius: 8,
padding: 16,
flexDirection: 'row',
alignItems: 'flex-start',
alignSelf: 'stretch',
marginBottom: 12,
},
privateOption: {
backgroundColor: colors.background,
borderWidth: 1,
borderColor: colors.border,
borderRadius: 8,
padding: 16,
flexDirection: 'column',
alignItems: 'flex-start',
alignSelf: 'stretch',
},
optionIcon: {
width: 40,
height: 40,
backgroundColor: colors.cardBackground,
borderRadius: 20,
marginRight: 12,
},
optionContent: {
flex: 1,
},
optionTitle: {
fontSize: 14,
fontWeight: '500',
color: colors.purple,
marginBottom: 4,
},
optionSubtitle: {
fontSize: 12,
color: colors.inactive,
},
optionDescription: {
fontSize: 12,
color: colors.inactive,
lineHeight: 18,
},
buttonContainer: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
paddingHorizontal: 20,
paddingTop: 16,
backgroundColor: colors.background,
},
nextButton: {
height: FIXED_BUTTON_HEIGHT,
backgroundColor: colors.buttonColor,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
},
nextButtonText: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: '700',
},
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0, 0, 0, 0.5)',
justifyContent: 'center',
alignItems: 'center',
},
modalContent: {
backgroundColor: colors.background,
borderRadius: 12,
padding: 24,
marginHorizontal: 16,
maxWidth: 320,
width: '100%',
alignItems: 'center',
},
modalTitle: {
fontSize: 18,
fontWeight: 'bold',
color: colors.text,
marginBottom: 8,
marginTop: 8,
},
modalSubtitle: {
fontSize: 14,
color: colors.inactive,
textAlign: 'center',
marginBottom: 24,
},
modalButtons: {
flexDirection: 'row',
width: '100%',
gap: 12,
},
closeButton: {
flex: 1,
paddingVertical: 12,
borderWidth: 1,
borderColor: colors.border,
borderRadius: 8,
alignItems: 'center',
},
closeButtonText: {
fontSize: 14,
color: colors.text,
fontWeight: '500',
},
saveImageButton: {
flex: 1,
paddingVertical: 12,
backgroundColor: colors.buttonColor,
borderRadius: 8,
alignItems: 'center',
},
saveImageButtonText: {
fontSize: 14,
color: colors.background,
fontWeight: '500',
},
});