import Pigicon from '@/assets/images/icons/dream_symbol/pig.svg';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { useDreamRecord } from '../../contexts/DreamRecordContext';
import IMAGES from '../assets/images';

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

// 감정 목록 (step1과 동일)
const MOODS = [
  { id: '1', name: '행복함', image: IMAGES.happy_icon },
  { id: '2', name: '슬픔', image: IMAGES.sad_icon },
  { id: '3', name: '분노', image: IMAGES.anger_icon },
  { id: '4', name: '흥분', image: IMAGES.excitement_icon },
  { id: '5', name: '감동', image: IMAGES.impressed_icon },
  { id: '6', name: '공포', image: IMAGES.scared_icon },
  { id: '7', name: '알 수 없음', image: IMAGES.ambiguous_icon },
];

const screenWidth = Dimensions.get('window').width;
const FIXED_BUTTON_HEIGHT = 56;

export default function RecordStep5Screen() {
  const {
    currentRecord,
    saveRecord,
    resetCurrent,
    getRecordById,
    getRecordByDate,
  } = useDreamRecord();

  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const BOTTOM_INSET = insets.bottom || 20;
  const [isSaved, setIsSaved] = useState(false);
  const viewRef = useRef(null);

  // ✅ params로 저장된 record 먼저 찾기
  const record =
    (params.id ? getRecordById(String(params.id)) : null) ??
    (params.date ? getRecordByDate(String(params.date)) : null);

  // ✅ record를 먼저 쓰고, 없으면 currentRecord
  const displayRecord = record ?? currentRecord;

  // ✅ 데모용 하드코딩 값
  const DEMO_TITLE = '돈을 뿌리다 쓰러진 돼지';
  const DEMO_SUMMARY =
    '꿈에서 돼지가 하늘을 날며 돈을 뿌렸고, 돈에는 숫자가 적혀 있었습니다. 이후 돼지가 갑자기 쓰러졌고 꿈이 끝났습니다. 꿈을 꾼 후 기분이 이상했습니다.';
  const DEMO_INTERPRETATION =
    '예상치 못한 기회와 불안정한 성공을 의미한다.';

  // ✅ 감정 태그도 displayRecord 기준
  const selectedMoodId = displayRecord?.mood ?? '1';
  const selectedMood = MOODS.find(m => m.id === selectedMoodId);

  // ✅ 화면에 뿌리는 데이터도 displayRecord 기준으로 통일
  const dreamTitle =
    displayRecord?.title?.trim() ? displayRecord.title : DEMO_TITLE;

  const dreamSummary =
    displayRecord?.analysis?.summary ?? displayRecord?.dreamText ?? DEMO_SUMMARY;

  const dreamInterpretation =
    displayRecord?.analysis?.interpretation ?? DEMO_INTERPRETATION;

  // (아래 handleSave/handleNext... 기존 그대로)


  const handleSave = () => {
    setIsSaved(true);
  };

  const handleNext = () => {
    console.log('💾 step5 저장 시작:', currentRecord);
    const selectedDate = params.selectedDate as string;
    saveRecord(selectedDate);     // ✅ 선택된 날짜로 저장
    console.log('💾 step5 저장 완료');
    resetCurrent();   // ✅ 현재 데이터 초기화
    router.replace('/(tabs)/calendar'); // 캘린더로 이동
  };

  const handleFinish = () => {
    const selectedDate = params.selectedDate as string;
    saveRecord(selectedDate);     // ✅ 선택된 날짜로 저장
    resetCurrent();   // 선택: 현재 작성 중이던 값 초기화
    router.replace('/(tabs)'); // 홈으로 이동
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

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{dreamTitle}</Text>
          
          {/* Character Image */}
          <View style={styles.characterBox}>
            <Pigicon />
          </View>

          {/* Dream Summary Input - 🔥 내용에 따라 자동 높이 조절 */}
          <View style={styles.inputContainer}>
            <Text style={styles.summaryText}>
              {DEMO_SUMMARY}
            </Text>
          </View>

      <View style={styles.optionsWrapper}>
        <View style={styles.interpretationOption}>
          {selectedMood && (
            <Image source={selectedMood.image} style={styles.moodIconOnly} />
          )}

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}> {dreamTitle} </Text>
            <Text style={styles.optionDescription}>
              {dreamInterpretation}
            </Text>
          </View>
        </View>
      </View>

        </ScrollView>

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
                <Pressable style={styles.closeButton} onPress={handleFinish}>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: FIXED_BUTTON_HEIGHT + 40,
  },
  characterBox: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
    marginTop: 0,
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
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  optionsWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  interpretationOption: {
    backgroundColor: colors.purpleLight,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  moodIconOnly: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
    flexShrink: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.purple,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.inactive,
    lineHeight: 18,
    flexWrap: 'wrap',
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
  moodLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});