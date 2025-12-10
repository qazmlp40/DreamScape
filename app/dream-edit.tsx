import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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
import Svg, { Path } from 'react-native-svg';


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

// 🔥 레이아웃 상수
const HEADER_HEIGHT = scale(64) + scale(24); // 상단 여백 + 헤더
const BOTTOM_PADDING = 24; // 하단 버튼 화면 끝에서 24px
const BUTTON_HEIGHT = 60;
const TEXTBOX_BUTTON_GAP = 20; // 텍스트박스와 버튼 사이 20px
const KEYBOARD_TEXTBOX_TOP = 16; // 키보드 올라왔을 때 헤더에서 16px

// 🔥 감정 이모지 아이콘
const moodIcons: { [key: string]: any } = {
    happy: require('../assets/images/happy_icon.png'),
    sad: require('../assets/images/Sad_icon.png'),
    angry: require('../assets/images/anger_icon.png'),
    excited: require('../assets/images/Excitement_icon.png'),
    impressed: require('../assets/images/Impressed_icon.png'),
    surprised: require('../assets/images/Scared_icon.png'),
};

// 🔥 더미 데이터
const dummyDreams = [
    { id: '1', date: '2025-12-01', emotion: 'happy', content: '바다에서 돌고래와 함께 수영하는 꿈을 꿨어요. 푸른 바다 속에서 돌고래들과 자유롭게 헤엄치며 놀았습니다.', keywords: ['바다', '돌고래', '자유'] },
    { id: '2', date: '2025-12-03', emotion: 'excited', content: '놀이공원에서 롤러코스터를 타는 꿈을 꿨어요. 빠른 속도로 날아다니며 스릴을 느꼈습니다.', keywords: ['놀이공원', '스릴', '재미'] },
    { id: '3', date: '2025-12-05', emotion: 'impressed', content: '우주에서 지구를 내려다보는 꿈을 꿨어요. 푸른 지구가 우주 속에서 빛나고 있었고, 그 아름다움에 감동했습니다.', keywords: ['우주', '지구', '경이로움'] },
    { id: '4', date: '2025-12-07', emotion: 'sad', content: '어릴 적 살던 집이 사라지는 꿈을 꿨어요. 추억이 담긴 집이 허물어지는 모습을 보며 슬퍼졌습니다.', keywords: ['추억', '상실', '그리움'] },
    { id: '5', date: '2025-12-09', emotion: 'surprised', content: '갑자기 하늘에서 눈이 내리는 꿈을 꿨어요. 여름인데 갑자기 하얀 눈이 내려서 놀랐습니다.', keywords: ['눈', '겨울', '놀라움'] },
];

// 🔥 뒤로가기 아이콘
const BackIcon = ({ size = 24, color = '#000000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M15 18L9 12L15 6"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// 🔥 음성인식 아이콘 (마이크)
const MicIcon = ({ size = 24, color = '#000000' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 19V23"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M8 23H16"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default function DreamEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const dreamDate = params.date as string;
    const dreamId = params.id as string;
    
    const [dreamData, setDreamData] = useState<typeof dummyDreams[0] | null>(null);
    const [dreamText, setDreamText] = useState('');
    const [isModified, setIsModified] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    // 🔥 애니메이션 값
    const contentAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log('DreamEdit - Params:', { dreamDate, dreamId });
        
        let foundDream = null;
        if (dreamId) {
            foundDream = dummyDreams.find(dream => dream.id === dreamId);
            console.log('Found dream by ID:', foundDream);
        } else if (dreamDate) {
            foundDream = dummyDreams.find(dream => dream.date === dreamDate);
            console.log('Found dream by date:', foundDream);
        }
        
        if (foundDream) {
            console.log('Setting dream data:', foundDream);
            setDreamData(foundDream);
            setDreamText(foundDream.content);
            setIsModified(false);
        } else if (dreamDate) {
            // 선택한 날짜에 꿈 기록이 없는 경우
            console.log('No dream found for date, creating empty data');
            setDreamData({ id: '', date: dreamDate, emotion: '', content: '', keywords: [] });
            setDreamText('');
            setIsModified(false);
        }
    }, [dreamDate, dreamId]);

    // 음성 텍스트가 전달되면 dreamText에 설정
    useEffect(() => {
        if (params.voiceText && typeof params.voiceText === 'string') {
            setDreamText(params.voiceText);
            setIsModified(true);
            // 음성 텍스트가 있어도 dreamData가 없으면 기본 데이터 생성
            if (!dreamData && dreamDate) {
                setDreamData({ id: '', date: dreamDate, emotion: 'happy', content: '', keywords: [] });
            }
        }
    }, [params.voiceText, dreamData, dreamDate]);

    // 🔥 키보드 이벤트 리스너
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setIsKeyboardVisible(true);
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
                setIsKeyboardVisible(false);
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
    }, []);

    // 🔥 키보드 닫기
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleTextChange = (text: string) => {
        setDreamText(text);
        if (dreamData) {
            setIsModified(text !== dreamData.content);
        }
    };

    const handleBack = () => {
        if (isModified) {
            Alert.alert(
                '변경사항 저장',
                '수정한 내용을 저장하지 않고 나가시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '나가기', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    const handleMicPress = () => {
        router.push('/voice-record');
    };

    const handleComplete = () => {
        if (!dreamText.trim()) {
            Alert.alert('알림', '꿈 내용을 입력해주세요.');
            return;
        }

        console.log('꿈 수정 완료:', {
            id: dreamData?.id,
            date: dreamData?.date,
            emotion: dreamData?.emotion,
            content: dreamText,
            updatedAt: new Date().toISOString(),
        });

        Alert.alert(
            '수정 완료',
            '꿈 내용이 수정되었습니다.',
            [{ text: '확인', onPress: () => router.back() }]
        );
    };

    const getEmotionIcon = () => {
        if (dreamData?.emotion && moodIcons[dreamData.emotion]) {
            return moodIcons[dreamData.emotion];
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
        outputRange: [scale(372), HEADER_HEIGHT + KEYBOARD_TEXTBOX_TOP],
    });
    
    // 🔥 텍스트박스 높이 계산
    // 기본: 버튼 위 24px까지
    // 키보드: 버튼 위 24px까지 확장
    const textBoxHeight = contentAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            SCREEN_HEIGHT - scale(372) - BOTTOM_PADDING - 60 - scale(24) - (Platform.OS === 'ios' ? 34 : 0),
            SCREEN_HEIGHT - HEADER_HEIGHT - KEYBOARD_TEXTBOX_TOP - BOTTOM_PADDING - BUTTON_HEIGHT - scale(24) - (Platform.OS === 'ios' ? 34 : 0)
        ],
    });

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.mainContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                
                {/* Status Bar 영역 */}
                <View style={styles.statusBarArea} />
                
                {/* 🔥 상단 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.headerBtn}
                        onPress={handleBack}
                    >
                        <BackIcon size={scale(24)} color="#000000" />
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>꿈 수정하기</Text>
                    
                    <TouchableOpacity 
                        style={styles.headerBtn}
                        onPress={handleMicPress}
                    >
                        <MicIcon size={scale(24)} color="#000000" />
                    </TouchableOpacity>
                </View>
                
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
                <View style={styles.buttonContainer}>
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
    
    statusBarArea: {
        height: scale(48),
    },
    
    // 🔥 상단 헤더
    header: {
        position: 'absolute',
        left: scale(16),
        top: scale(64),
        width: scale(380),
        height: scale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    
    headerBtn: {
        width: scale(24),
        height: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    headerTitle: {
        fontSize: scale(18),
        fontWeight: '600',
        color: colors.text,
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
        bottom: BOTTOM_PADDING + (Platform.OS === 'ios' ? 34 : 0), // iOS Safe Area 포함
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