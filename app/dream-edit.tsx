import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDialog } from '../contexts/AppDialogContext';
import { dreamApi } from '../services/dreamApi';
import {
    ambiguous_icon,
    anger_icon,
    excitement_icon,
    happy_icon,
    impressed_icon,
    sad_icon,
    scared_icon,
} from './assets/images';


// 📐 반응형 유틸리티
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 412;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

// 공통 색상
const colors = {
    primary: '#BB7CFF',
    text: '#1F2937',
    background: '#FFFFFF',
    placeholder: '#9CA3AF',
};

// 디자인 상수
const HEADER_BG_COLOR = '#FFFFFF';
const HEADER_TEXT_COLOR = '#1F2937';

// 🔥 레이아웃 상수
const HEADER_CONTENT_HEIGHT = 56;
const HEADER_HEIGHT = HEADER_CONTENT_HEIGHT; // 상단 여백 + 헤더
const BOTTOM_PADDING = 24; // 하단 버튼 화면 끝에서 24px
const BUTTON_HEIGHT = 60;
const KEYBOARD_TEXTBOX_TOP = 16; // 키보드 올라왔을 때 헤더에서 16px

// 🔥 감정 이모지 아이콘
const moodIcons: { [key: string]: any } = {
    '1': happy_icon,
    '2': sad_icon,
    '3': anger_icon,
    '4': excitement_icon,
    '5': impressed_icon,
    '6': scared_icon,
    '7': ambiguous_icon,
};

/**
 * 커스텀 헤더 (흰색 + 마이크 음성인식)
 */
const CustomRecordHeader = ({ title, onMicPress, onBackPress }: { title: string; onMicPress?: () => void; onBackPress?: () => void }) => {
    const insets = useSafeAreaInsets();

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
                onPress={onBackPress}
                style={headerStyles.headerLeft}
                accessibilityRole="button"
                accessibilityLabel="뒤로가기"
            >
                <Ionicons name="chevron-back" size={24} color={HEADER_TEXT_COLOR} />
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

export default function DreamEditScreen() {
    const { showDialog } = useAppDialog();
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    
    const dreamDate = params.date as string;
    const dreamId = params.dreamId as string | undefined;
    
    const [dreamData, setDreamData] = useState<any>(null);
    const [dreamText, setDreamText] = useState('');
    const [isModified, setIsModified] = useState(false);
    
    // 🔥 애니메이션 값
    const contentAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadDream = async () => {
            console.log('DreamEdit - Params:', { dreamDate, dreamId });

            if (!dreamId) {
                if (dreamDate) {
                    setDreamData({ dreamId: undefined, date: dreamDate, mood: '1', dreamText: '', analysis: null });
                    setDreamText('');
                    setIsModified(false);
                }
                return;
            }

            try {
                const foundDream = await dreamApi.getDreamById(Number(dreamId));

                if (foundDream) {
                    const normalizedDream = {
                        dreamId: Number(foundDream.dreamId ?? foundDream.id ?? dreamId),
                        date: String(foundDream.date ?? foundDream.dreamDate ?? foundDream.createdAt ?? dreamDate ?? '').slice(0, 10),
                        mood: (() => {
                            const mood = String(foundDream.mood ?? foundDream.emotion ?? '7').trim();
                            switch (mood) {
                                case '1':
                                case '행복':
                                case '행복함':
                                case 'happy':
                                    return '1';
                                case '2':
                                case '슬픔':
                                case 'sad':
                                    return '2';
                                case '3':
                                case '분노':
                                case 'anger':
                                    return '3';
                                case '4':
                                case '신남':
                                case '흥분':
                                case 'excited':
                                    return '4';
                                case '5':
                                case '감동':
                                case 'touched':
                                    return '5';
                                case '6':
                                case '공포':
                                case 'fear':
                                case 'scared':
                                    return '6';
                                default:
                                    return '7';
                            }
                        })(),
                        title: String(foundDream.title ?? foundDream.dreamTitle ?? ''),
                        dreamText: String(foundDream.rawText ?? foundDream.content ?? ''),
                        analysis: {
                            summary: String(foundDream.aiSummary ?? foundDream.summary ?? ''),
                            interpretation: String(foundDream.aiInterpretation ?? foundDream.interpretation ?? foundDream.analysisText ?? ''),
                            tags: foundDream.tags ?? [],
                        },
                    };

                    setDreamData(normalizedDream);
                    setDreamText(normalizedDream.dreamText);
                    setIsModified(false);
                    return;
                }
            } catch (error) {
                console.error('DreamEdit fetch error:', error);
            }

            if (dreamDate) {
                setDreamData({ dreamId: Number(dreamId), date: dreamDate, mood: '1', dreamText: '', analysis: null });
                setDreamText('');
                setIsModified(false);
            }
        };

        loadDream();
    }, [dreamDate, dreamId]);

    // 음성 텍스트가 전달되면 dreamText에 설정
    useEffect(() => {
        if (params.voiceText && typeof params.voiceText === 'string') {
            setDreamText(params.voiceText);
            setIsModified(true);
            // 음성 텍스트가 있어도 dreamData가 없으면 기본 데이터 생성
            if (!dreamData && dreamDate) {
                setDreamData({ localId: '', date: dreamDate, mood: '1', dreamText: '', analysis: null });
            }
        }
    }, [params.voiceText, dreamData, dreamDate]);

    // 🔥 키보드 이벤트 리스너
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(contentAnimation, {
                    toValue: 1,
                    duration: Platform.OS === 'ios' ? 250 : 100,
                    useNativeDriver: false,
                }).start();
            }
        );
        
        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(contentAnimation, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? 250 : 100,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, [contentAnimation]);

    // 🔥 키보드 닫기
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleTextChange = (text: string) => {
        setDreamText(text);
        if (dreamData) {
            setIsModified(text !== dreamData.dreamText);
        }
    };

    const handleBack = () => {
        if (isModified) {
            showDialog({
                title: '변경사항 저장',
                message: '수정한 내용을 저장하지 않고 나가시겠습니까?',
                buttons: [
                    { text: '취소', style: 'cancel' },
                    { text: '나가기', onPress: () => router.back() },
                ],
            });
        } else {
            router.back();
        }
    };

    const handleMicPress = () => {
        const returnPath = `/dream-edit?date=${dreamDate}${dreamId ? `&dreamId=${dreamId}` : ''}`;
        router.push(`/voice-record?returnPath=${encodeURIComponent(returnPath)}`);
    };

    const handleComplete = async () => {
        if (!dreamText.trim()) {
            showDialog({ title: '알림', message: '꿈 내용을 입력해주세요.' });
            return;
        }

        if (!dreamData?.dreamId) {
            showDialog({ title: '오류', message: '수정할 꿈 정보를 찾지 못했어요.' });
            return;
        }

        try {
            await dreamApi.updateDream(dreamData.dreamId, {
                title: dreamData.title ?? '',
                dreamText: dreamText.trim(),
                mood: dreamData.mood,
                summary: dreamData.analysis?.summary,
                interpretation: dreamData.analysis?.interpretation,
            });

            setDreamData((prev: any) => (
                prev
                    ? {
                        ...prev,
                        dreamText: dreamText.trim(),
                    }
                    : prev
            ));
            setIsModified(false);

            showDialog({
                title: '수정 완료',
                message: '꿈 내용이 수정되었습니다.',
                buttons: [{ text: '확인', onPress: () => router.push('/(tabs)/calendar') }],
            });
        } catch (error) {
            console.error('Dream update error:', error);
            showDialog({
                title: '오류',
                message: '꿈 수정에 실패했어요. 잠시 후 다시 시도해주세요.',
            });
        }
    };

    const getEmotionIcon = () => {
        if (dreamData?.mood && moodIcons[dreamData.mood]) {
            return moodIcons[dreamData.mood];
        }
        return null;
    };

    const formatDate = () => {
        const dateToUse = dreamData?.date || dreamDate;
        if (!dateToUse) return '';
        const date = new Date(dateToUse);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}월 ${day}일의 꿈`;
    };

    // 🔥 애니메이션 보간 값들
    const imageOpacity = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });
    
    const imageScale = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
    });
    
    const dateLabelOpacity = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    // 🔥 텍스트박스 위치 계산
    // 기본: 화면 하단에서 24px(버튼하단) + 60px(버튼높이) + 20px(간격) 위
    // 키보드: 헤더에서 16px 아래
    const textBoxTop = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [scale(372), (HEADER_HEIGHT + insets.top) + KEYBOARD_TEXTBOX_TOP],
    });
    
    // 🔥 텍스트박스 높이 계산
    // 기본: 버튼 위 24px까지
    // 키보드: 버튼 위 24px까지 확장
    const textBoxHeight = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            SCREEN_HEIGHT - scale(372) - BOTTOM_PADDING - 60 - scale(24) - insets.bottom,
            SCREEN_HEIGHT - (HEADER_HEIGHT + insets.top) - KEYBOARD_TEXTBOX_TOP - BOTTOM_PADDING - BUTTON_HEIGHT - scale(24) - insets.bottom
        ],
    });

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.mainContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                
                {/* 헤더 */}
                <CustomRecordHeader 
                    title="꿈 수정하기" 
                    onMicPress={handleMicPress} 
                    onBackPress={handleBack}
                />
                
                {/* 🔥 이미지 영역 - 키보드 올라오면 사라짐 */}
                <Animated.View style={[
                    styles.imageContainer,
                    {
                        opacity: imageOpacity,
                        transform: [{ scale: imageScale }],
                    }
                ]}>
                    {getEmotionIcon() ? (
                        <Image 
                            source={getEmotionIcon()} 
                            style={styles.emotionImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder} />
                    )}
                </Animated.View>
                
                {/* 🔥 날짜 라벨 - 키보드 올라오면 사라짐 */}
                <Animated.Text style={[
                    styles.dateLabel,
                    { opacity: dateLabelOpacity }
                ]}>
                    {formatDate()}
                </Animated.Text>
                {/* 🔥 텍스트 입력 박스 - 애니메이션 적용 */}
                <Animated.View style={[
                    styles.contentBox,
                    {
                        top: textBoxTop,
                        height: textBoxHeight,
                    }
                ]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="꿈 내용을 입력해주세요..."
                        placeholderTextColor={colors.placeholder}
                        multiline
                        textAlignVertical="top"
                        value={dreamText}
                        onChangeText={handleTextChange}
                    />
                </Animated.View>
                
                {/* 🔥 완료 버튼 - 하단 24px 고정 */}
                <View style={[styles.buttonContainer, { bottom: BOTTOM_PADDING + insets.bottom }]}>
                    <TouchableOpacity 
                        style={[
                            styles.completeBtn,
                            (!dreamText.trim() || !isModified) && styles.completeBtnDisabled
                        ]}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                        disabled={!dreamText.trim() || !isModified}
                    >
                        <Text style={styles.completeBtnText}>
                            {isModified ? '수정 완료' : '완료'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    

    
    // 🔥 이미지 영역
    imageContainer: {
        position: 'absolute',
        left: scale(106),
        top: scale(128),
        width: scale(200),
        height: scale(200),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    emotionImage: {
        width: 200,
        height: 200,
    },
    
    imagePlaceholder: {
        width: scale(200),
        height: scale(200),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(16),
    },
    
    // 🔥 날짜 라벨
    dateLabel: {
        position: 'absolute',
        top: scale(340),
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.placeholder,
    },
    
    // 🔥 텍스트 입력 박스 - Animated로 위치/높이 변경
    contentBox: {
        position: 'absolute',
        left: scale(32),
        width: scale(348),
        backgroundColor: '#FFFFFF',
        borderRadius: scale(8),
        padding: scale(16),
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.25)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    
    textInput: {
        flex: 1,
        fontSize: scale(15),
        color: colors.text,
        lineHeight: scale(24),
    },
    
    // 🔥 버튼 컨테이너 - 하단 24px 고정
    buttonContainer: {
        position: 'absolute',
        left: scale(16),
        right: scale(16),
        bottom: BOTTOM_PADDING, // iOS Safe Area는 인라인 스타일로 추가
    },
    
    // 🔥 완료 버튼
    completeBtn: {
        width: '100%',
        height: 60,
        backgroundColor: colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#BB7CFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    
    completeBtnDisabled: {
        backgroundColor: '#D9D9D9',
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    
    completeBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
