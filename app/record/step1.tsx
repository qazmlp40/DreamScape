import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    ImageSourcePropType,
    Platform,
    Pressable,
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
import IMAGES from '../assets/images';
import { clamp } from '../utils/responsive';


// 화면 크기
const { width: screenWidth } = Dimensions.get('window');
const containerWidth = Math.min(412, screenWidth);

// Responsive helpers
const HORIZONTAL_PADDING = Math.min(20, Math.round(screenWidth * 0.05));

// 디자인 상수
const HEADER_BG_COLOR = '#FFFFFF';
const HEADER_TEXT_COLOR = '#1F2937';

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

/**
 * 커스텀 헤더 (흰색 + 마이크 음성인식)
 */
const CustomRecordHeader = ({ title, onMicPress }: { title: string; onMicPress?: () => void }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const HEADER_CONTENT_HEIGHT = 56;

    return (
        <View
            style={[
                headerStyles.headerContainer,
                {
                    height: HEADER_CONTENT_HEIGHT + insets.top,
                    paddingTop: insets.top,
                    backgroundColor: HEADER_BG_COLOR,
                    borderBottomWidth: 0,
                }
            ]}
        >
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={headerStyles.headerLeft}
                accessibilityRole="button"
                accessibilityLabel="뒤로가기"
            >
                <Ionicons name="arrow-back" size={24} color={HEADER_TEXT_COLOR} />
            </TouchableOpacity>

            {/* 제목: 한 줄로 제한 (넘치면 ...으로) */}
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[headerStyles.headerTitle, { color: '#282828', marginLeft: 4 }]}
            >
                {title}
            </Text>

            {/* 음성인식(마이크) 아이콘 */}
            <TouchableOpacity
                onPress={onMicPress}
                style={headerStyles.headerRight}
                accessibilityRole="button"
                accessibilityLabel="음성으로 입력"
            >
                <Ionicons name="mic-outline" size={24} color={HEADER_TEXT_COLOR} />
            </TouchableOpacity>
        </View>
    );
};

const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    headerLeft: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.36,
        textAlign: 'left',
        color: '#282828',
        flex: 1,
        zIndex: 1,
    },
    headerRight: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
});

export default function RecordStep1Screen() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [dreamContent, setDreamContent] = useState('');
    const [isListening, setIsListening] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;
    const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

    // 음성 텍스트가 전달되면 dreamContent에 설정
    useEffect(() => {
        if (params.voiceText && typeof params.voiceText === 'string') {
            setDreamContent(params.voiceText);
        }
    }, [params.voiceText]);



    const handleNext = () => {
        if (selectedMood && dreamContent.trim()) {
            router.push('/record/step2' as any);
        } else {
            console.log("감정과 꿈 내용을 모두 입력해주세요.");
        }
    };

    const handleMicPress = async () => {
        router.push('/voice-record');
    };

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <CustomRecordHeader title="꿈 기록" onMicPress={handleMicPress} />

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
                    <View style={styles.characterBox}>
                        <Text style={styles.characterPlaceholder}>꿈 상징 캐릭터</Text>
                        <Text style={styles.characterSubText}>제작 중 이미지</Text>
                    </View>
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

            {/* 하단 버튼 */}
            <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}>
                <Pressable
                    onPress={handleNext}
                    style={[
                        styles.nextButton,
                        { opacity: (selectedMood && dreamContent.trim()) ? 1 : 0.5 }
                    ]}
                    disabled={!(selectedMood && dreamContent.trim())}
                >
                    <Text style={styles.nextButtonText}>완료</Text>
                </Pressable>
            </View>
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
    characterBox: {
        width: 142,
        height: 142,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
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

    // 하단 버튼
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    nextButton: {
        height: FIXED_BUTTON_HEIGHT,
        backgroundColor: colors.recordButtonColor,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
});