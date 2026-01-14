import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 디자인 상수
const HEADER_BG_COLOR = '#FFFFFF';
const HEADER_TEXT_COLOR = '#1F2937';

const colors = {

    primary: '#5B76EE',
    text: '#1F2937',
    background: '#FFFFFF',
    recordButtonColor: '#BB7CFF',
    stopButton: '#FF6B6B',
    inactive: '#9CA3AF',
};

/**
 * 커스텀 헤더 (흰색 + 뒤로가기)
 */
const CustomVoiceHeader = ({ title, onBackPress }: { title: string; onBackPress?: () => void }) => {
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
                onPress={onBackPress}
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
        </View>
    );
};

const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontFamily: 'Roboto',
    },
    headerRight: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
});

export default function VoiceRecordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const returnPath = params.returnPath as string;
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [hasStopped, setHasStopped] = useState(false);
    const [showGradient, setShowGradient] = useState(false);
    const [scrollOffset, setScrollOffset] = useState(0);
    const pulseAnim = new Animated.Value(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recognitionRef = useRef<any>(null);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleStartRecording = async () => {
        setError(null);
        setIsRecording(true);
        
        // 처음 시작이면 텍스트 초기화, 재시작이면 기존 텍스트 유지
        if (!hasStopped) {
            setRecordedText('');
        }
        setHasStopped(false);
        
        // 기존 타이머 정리
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        
        // 단어별로 실시간 표시 데모 (긴 버전)
        const words = ['돼지가','갑자기','하늘을','개날았삼','그리고','돈을','개뿌림','근데','그','돈에','숫자가','적혀있었거든','근데','돼지가','갑자기','쓰러졌어','그리고','꿈이','끝남','기분이','좀','이상한데'];
        let currentText = recordedText; // 기존 텍스트에서 시작
        
        words.forEach((word, index) => {
            const timeout = setTimeout(() => {
                currentText += (currentText === '' ? '' : ' ') + word;
                setRecordedText(currentText);
                
                // 글자수 기준으로 스크롤과 그라디언트 조건 설정
                const shouldScroll = currentText.length >= 170; // 170자 이상
                setShowGradient(shouldScroll);
                
                // 170자 이상일 때만 한줄씩 스크롤
                if (shouldScroll) {
                    setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: (currentText.length - 170) * 0.5, animated: true });
                    }, 100);
                }
                
                // 마지막 단어일 때는 녹음 상태를 유지하고 hasStopped만 true로 설정
                if (index === words.length - 1) {
                    // 녹음 상태는 유지되, 완료 상태로 표시
                    // setIsRecording(false); 제거
                }
            }, (index + 1) * 800);
            timeoutsRef.current.push(timeout);
        });
    };

    const handleStopRecording = async () => {
        // 모든 타이머 중지
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        
        setIsRecording(false);
        setHasStopped(true);
        
        // 녹음 중지만 하고 화면에 남아있기
    };

    const handleConfirm = () => {
        if (recordedText.trim()) {
            if (returnPath) {
                // returnPath가 있으면 해당 경로로 이동
                const url = new URL(returnPath, 'http://localhost');
                url.searchParams.set('voiceText', recordedText);
                router.push(url.pathname + url.search as any);
            } else {
                // 기본적으로 step1로 이동
                router.push({
                    pathname: '/record/step1',
                    params: { voiceText: recordedText }
                });
            }
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* 헤더 */}
            <CustomVoiceHeader title="음성 녹음" onBackPress={() => router.back()} />
            
            <View style={styles.contentArea}>
                <View style={styles.scrollContent}>
                    <View style={styles.characterSection}>
                        <Animated.View style={[styles.characterBox, { transform: [{ scale: pulseAnim }] }]}>
                            <View style={styles.micButton}>
                                <Ionicons
                                    name="mic"
                                    size={64}
                                    color="white"
                                />
                            </View>
                        </Animated.View>
                    </View>

                    <Text style={styles.headerTitle}>
                        {isRecording ? '꿈 이야기를 듣고있어요' : (hasStopped && recordedText) ? '꿈 이야기가 멈췄어요' : recordedText ? '꿈 이야기를 듣고있어요' : '오늘은 어떤 꿈을 꾸었나요?'}
                    </Text>

                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {(isRecording || recordedText) && (
                        <View style={styles.liveTextSection}>
                            {showGradient && (
                                <LinearGradient
                                    colors={['#FFFFFF', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)']}
                                    locations={[0, 0.6, 1]}
                                    style={styles.gradientOverlay}
                                    pointerEvents="none"
                                />
                            )}
                            <ScrollView 
                                ref={scrollViewRef}
                                style={styles.liveTextContainer}
                                contentContainerStyle={[styles.scrollContentContainer, { paddingTop: showGradient ? 80 : 0 }]}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.liveText}>{recordedText || ''}</Text>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
            
            <View style={styles.buttonContainer}>
                {isRecording && (
                    <Pressable
                        onPress={handleStopRecording}
                        style={styles.stopButton}
                    >
                        <Text style={styles.stopButtonText}>녹음 중지</Text>
                    </Pressable>
                )}
                
                <Pressable
                    onPress={isRecording ? handleConfirm : hasStopped ? handleStartRecording : handleStartRecording}
                    style={styles.recordButton}
                >
                    <Text style={styles.recordButtonText}>
                        {isRecording ? '녹음 종료' : hasStopped ? '녹음 시작' : '녹음 시작'}
                    </Text>
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
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        flex: 1,
    },
    headerTitle: {
        color: '#BB7CFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 16,
        alignSelf: 'center',
        width: '100%',
    },
    liveTextSection: {
        width: '100%',
        flex: 1,
        marginTop: 16,
        position: 'relative',
    },
    liveTextContainer: {
        width: '100%',
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingTop: 0,
    },
    liveText: {
        color: '#919191',
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 23,
        textAlign: 'center',
        paddingBottom: 80,
        minHeight: 100,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 1,
    },
    characterSection: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 150,
    },
    characterBox: {
        display: 'flex',
        width: 140,
        height: 140,
        padding: 38,
        alignItems: 'center',
        gap: 10,
        borderRadius: 70,
        backgroundColor: '#BB7CFF',
        ...Platform.select({
            ios: {
                shadowColor: '#BB7CFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 16,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    micButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 34,
        backgroundColor: colors.background,
    },
    stopButton: {
        width: '100%',
        height: 60,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.recordButtonColor,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopButtonText: {
        color: colors.recordButtonColor,
        fontSize: 18,
        fontWeight: '700',
    },
    recordButton: {
        backgroundColor: colors.recordButtonColor,
        height: 60,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
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
    recordButtonText: {
        color: colors.background,
        fontSize: 18,
        fontWeight: '700',
    },
    errorText: {
        fontSize: 14,
        color: colors.stopButton,
        textAlign: 'center',
        marginTop: 8,
    },
});