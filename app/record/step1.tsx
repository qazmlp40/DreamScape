import FixedBottomButton from '@/components/app/FixedBottomButton';
import RecordHeader from '@/components/app/RecordHeader';
import { dreamApi } from '@/services/dreamApi';
import { clamp } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    Platform,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDialog } from '../../contexts/AppDialogContext';
import { useDreamRecord } from '../../contexts/DreamRecordContext';
import IMAGES from '../assets/images';

// 화면 크기
const { width: screenWidth } = Dimensions.get('window');
// Responsive helpers
const HORIZONTAL_PADDING = Math.min(20, Math.round(screenWidth * 0.05));

const colors = {
    primary: '#5B76EE',
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F3F4F6',
    border: '#E5E7EB',
    recordButtonColor: '#BB7CFF',
    inactive: '#9CA3AF',
    inputBorder: '#E8E8E8',
    divider: '#F0F0F0',
};

// 감정 목록
const MOODS = [
    { id: '1', name: '행복함', image: IMAGES.happy_icon, nImage: IMAGES.Nhappy_icon },
    { id: '2', name: '슬픔', image: IMAGES.sad_icon, nImage: IMAGES.Nsad_icon },
    { id: '3', name: '분노', image: IMAGES.anger_icon, nImage: IMAGES.Nanger_icon },
    { id: '4', name: '흥분', image: IMAGES.excitement_icon, nImage: IMAGES.Nexcitement_icon },
    { id: '5', name: '감동', image: IMAGES.impressed_icon, nImage: IMAGES.Nimpressed_icon },
    { id: '6', name: '공포', image: IMAGES.scared_icon, nImage: IMAGES.Nscared_icon },
    { id: '7', name: '알 수 없음', image: IMAGES.ambiguous_icon as ImageSourcePropType, nImage: IMAGES.Nambiguous_icon as ImageSourcePropType },
];

const FIXED_BUTTON_HEIGHT = 56;
export default function RecordStep1Screen() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [dreamContent, setDreamContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showDialog } = useAppDialog();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;
    const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);
    const { setMood, setDreamText, saveRecord, updateRecordByLocalId } = useDreamRecord();

    // [step 1 - 꿈 기록 화면]
    // 서버 dreamId를 플로우의 기준으로 삼고, 로컬 record는 즉시 화면 복구용 보조 캐시로만 사용한다.
    const submitDreamToServer = async (emotion: string, content: string, selectedDate?: string) => {
        setIsSubmitting(true);
        try {
          const date = selectedDate ?? new Date().toISOString().slice(0, 10);
          console.log('[Step1] submitDreamToServer selectedDate:', selectedDate);
          console.log('[Step1] submitDreamToServer final date:', date);
      
          const saved = await dreamApi.saveDream({
            date,
            title: '',
            dreamText: content,
            mood: convertMoodToServerMood(emotion),
          });
          console.log('[Step1] saveDream response:', saved);
      
          const dreamId = saved.dreamId;

          return { dreamId };
        } catch (error: any) {
          console.error('Dream submit error:', error);
          return null;
        } finally {
          setIsSubmitting(false);
        }
      };

      const convertMoodToServerMood = (moodId: string) => {
        switch (moodId) {
          case "1":
            return "행복";
          case "2":
            return "슬픔";
          case "3":
            return "분노";
          case "4":
            return "신남";
          case "5":
            return "감동";
          case "6":
            return "공포";
          case "7":
            return "미묘";
          default:
            return "미묘";
        }
      };

    const handleNext = async () => {
        if (!(selectedMood && dreamContent.trim())) {
            showDialog({ title: '안내', message: '감정과 꿈 내용을 모두 입력해 주세요.' });
            return;
          }
        
          const selectedDate = params.selectedDate as string | undefined;
          const trimmedContent = dreamContent.trim();
          console.log('[Step1] route params:', params);
          console.log('[Step1] handleNext selectedDate:', selectedDate);
        
          setMood(selectedMood);
          setDreamText(trimmedContent);
          
          // 백엔드 저장 후 dreamId 받기 (DreamEntity 생성)
          const res = await submitDreamToServer(selectedMood, trimmedContent, selectedDate);
        
          if (!res?.dreamId) {
            showDialog({ title: '오류', message: '꿈을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.' });
            return;
          }
        
          const dreamId = res.dreamId;

          // 로컬 record는 서버 플로우를 막지 않는 보조 캐시로 저장한다.
          const localId = saveRecord({
            selectedDate,
            title: '',
            mood: selectedMood,
            dreamText: trimmedContent,
            analysis: null,
            videoUrl: null,
            dreamId,
          });

            if (localId) {
                updateRecordByLocalId(localId, { dreamId });
            }

            router.replace({
	                pathname: '/record/analysis-loading',
	                params: {
                    dreamId: String(dreamId),
                    dreamText: trimmedContent,
                    mood: selectedMood,
                    ...(localId ? { localId } : {}),
                    ...(selectedDate ? { selectedDate } : {}),
                },
	            } as any);
    };

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <RecordHeader title="꿈 기록" backIcon="arrow-back" />

            {/* 콘텐츠 */}
            <KeyboardAwareScrollView
                ref={scrollViewRef}
                style={styles.contentArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={200}
                keyboardShouldPersistTaps="handled"
                scrollToOverflowEnabled={true}
            >
                {/* 1. 프롬프트 */}
                <View style={styles.promptSection}>
                    <Text style={styles.promptLine1}>오늘의 꿈은 어땠나요?</Text>
                    <Text style={styles.promptLine2}>
                        좋은 꿈이었나요? 나쁜꿈이었나요?
                    </Text>
                </View>

                {/* 2. 캐릭터 박스 */}
                <View style={styles.characterSection}>
                    <Image
                        source={require('../../assets/images/icons/making_image.png')}
                        style={{ width: 120, height: 120 }}
                        resizeMode="contain"
                    />
                </View>

                {/* 3. 오늘의 감정 */}
                <View style={styles.moodSection}>
                    <Text style={[styles.sectionTitle, styles.moodSectionTitle]}>오늘의 감정</Text>
                    <ScrollView
                        horizontal
                        nestedScrollEnabled={true}
                        directionalLockEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.moodScrollContainer}
                        style={styles.moodScrollView}
                    >
                        {MOODS.map((mood, idx) => (
                            <TouchableOpacity
                                key={mood.id}
                                activeOpacity={0.8}
                                style={[
                                    styles.moodItem,
                                    { marginRight: 24 },
                                    { marginLeft: idx === 0 ? 16 : 0 },
                                ]}
                                onPress={() => setSelectedMood(mood.id)}
                                accessibilityLabel={`감정 ${mood.name}`}
                            >
                                <RNImage 
                                    source={selectedMood && selectedMood !== mood.id ? mood.nImage : mood.image} 
                                    style={styles.moodImage} 
                                />
                                {selectedMood === mood.id ? (
                                    <Text style={styles.moodName}>{mood.name}</Text>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. 나의 꿈 이야기 */}
                <View style={styles.dreamInputSection}>
                    <Text style={styles.sectionTitle}>나의 꿈 이야기</Text>
                    <View style={styles.dreamInputCard}>
                        <TextInput
                            style={styles.dreamInput}
                            placeholder="오늘의 꿈을 작성해보세요!"
                            placeholderTextColor={colors.inactive}
                            multiline={true}
                            value={dreamContent}
                            onChangeText={setDreamContent}
                            textAlignVertical="top"
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollToPosition(0, 400, true);
                                }, 100);
                            }}
                        />
                    </View>
                </View>

                {/* 하단 여백 */}
                <View style={{ height: FIXED_BUTTON_HEIGHT + BOTTOM_INSET + 40 }} />
            </KeyboardAwareScrollView>

            <FixedBottomButton
                label="완료"
                onPress={handleNext}
                disabled={isSubmitting || !(selectedMood && dreamContent.trim())}
                showDivider
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 24,
        paddingBottom: 20,
    },

    // 프롬프트
    promptSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    promptLine1: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    promptLine2: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        textAlign: 'center',
        opacity: 0.6,
    },

    // 캐릭터 박스
    characterSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    characterPlaceholder: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.inactive,
        marginBottom: 10,
    },
    characterSubText: {
        fontSize: 12,
        color: colors.inactive,
        marginTop: -12,
    },

    // 오늘의 감정
    moodSection: {
        display: 'flex',
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        width: '100%',
        minHeight: 80,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
        marginLeft: 0,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    moodScrollView: {
        marginHorizontal: -HORIZONTAL_PADDING,
    },
    moodScrollContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 0,
        marginBottom: 12,
        alignSelf: 'stretch',
    },
    moodItem: {
        display: 'flex',
        width: 58,
        minHeight: 72,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    moodItemSelected: {
        borderWidth: 3,
        borderColor: colors.primary,
        transform: [{ scale: 1.05 }],
    },
    moodEmoji: {
        fontSize: clamp(Math.round(screenWidth * 0.06), 18, 32),
    },
    moodImage: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
    },
    moodName: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },

    moodSectionTitle: {
        marginBottom: 12,
    },

    // 꿈 이야기 입력
    dreamInputSection: {
        width: '100%',
        marginBottom: 12,
    },
    dreamInputCard: {
        width: '100%',
        minHeight: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        padding: 16,
        backgroundColor: colors.background,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    dreamInput: {
        flex: 1,
        width: '100%',
        fontSize: 14,
        color: colors.text,
        padding: 0,
        textAlignVertical: 'top',
        lineHeight: 20,
    },

});
