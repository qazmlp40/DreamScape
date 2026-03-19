import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
// 영상 컴포넌트 임포트
// 실제 프로젝트에서는 'react-native-video' 설치 필요
import { useDreamRecord } from '@/contexts/DreamRecordContext';
import { dreamApi } from '@/services/dreamApi';
import { ResizeMode, Video } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F3F4F6',
    border: '#E5E7EB',
    buttonColor: '#BB7CFF',
    inactive: '#9CA3AF',
};

const FIXED_BUTTON_HEIGHT = 56;

// [step 4 - 제작 중... / 무드보드 영상 화면]
// 1) 전달받은 dreamId로 AI 영상 생성 API를 요청한다
// 2) 생성된 videoUrl을 현재 local record에 저장한다
// 3) videoUrl이 있으면 영상을 보여주고, 없으면 제작 중 UI를 보여준다
export default function RecordStep4Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;

    const [showNextButton, setShowNextButton] = useState(false);

    const dreamIdParam = params.dreamId;
    const dreamId = typeof dreamIdParam === 'string' ? Number(dreamIdParam) : NaN;

    const localIdParam = params.localId;
    const localId = typeof localIdParam === 'string' ? localIdParam : '';
    
    // // Context에 저장된 videoUrl 사용
    // // Step4에서 영상 생성 성공 시 setVideoUrl로 갱신됨
    // const {
    //     currentDreamText: contextDreamText = '', // DreamRecordContext에 저장되어 있는 꿈 내용
    //     setVideoUrl,
    // } = useDreamRecord();

    // const { currentVideoUrl } = useDreamRecord();
    // // 또는 const { currentRecord } = useDreamRecord(); currentRecord.videoUrl
    // const videoUrl = currentVideoUrl;

    // console.log('Step4 videoUrl:', videoUrl);
    const { getRecordByLocalId, updateRecordByLocalId } = useDreamRecord();

    // 현재 dreamId와 같은 꿈 record 찾기
    const currentRecord = localId ? getRecordByLocalId(localId) : undefined;

    // 현재 꿈의 videoUrl만 사용 
    const videoUrl = currentRecord?.videoUrl ?? null;

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNextButton(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // useEffect(()=> {
    //     const run = async () => {
    //         const dreamIdParam = params.dreamId;
    //         const dreamId = typeof dreamIdParam === 'string' ? Number(dreamIdParam) : NaN;
            
    //         if (!dreamId || Number.isNaN(dreamId)) {
    //             console.error('유효하지 않은 dreamId:', dreamIdParam);
    //             return;
    //         }

    //         try {
    //             const videoRes = await dreamApi.generateVideo(dreamId);
    //             console.log('dreamApi.generateVideo 응답:', videoRes);
    //             setVideoUrl(videoRes.mediaUrl ?? ''); 
    //         } catch (e: any) {
    //             console.error(
    //               '영상 생성 오류:',
    //               e?.response?.status,
    //               e?.response?.data || e
    //             );
    //             setVideoUrl('');
    //           }
    //     };
    //         run();
    //     }, [params.dreamId]);

    useEffect(() => {
        const run = async () => {
            if (!dreamId || Number.isNaN(dreamId)) {
                console.error('유효하지 않은 dreamId:', dreamIdParam);
                return;
            }

            if (!localId) {
                console.error('localId가 없습니다.');
                return;
            }
    
            // 이미 현재 꿈 videoUrl이 있으면 다시 요청 안 함
            if (videoUrl) {
                console.log('이미 현재 꿈의 videoUrl 존재:', videoUrl);
                return;
            }
    
            try {
                const videoRes = await dreamApi.generateVideo(dreamId);
                console.log('dreamApi.generateVideo 응답:', videoRes);
    
                if (localId) {
                    updateRecordByLocalId(localId, {
                      dreamId,
                      videoUrl: videoRes.mediaUrl ?? undefined,
                    });
                }
            } catch (e: any) {
                console.error(
                    '영상 생성 오류:',
                    e?.response?.status,
                    e?.response?.data || e
                );
            }
        };
    
        run();
    }, [dreamId, videoUrl]);

    const handleSkip = () => {
        setShowNextButton(true);
    };

    const handleNext = () => {
        const date = params.date as string | undefined;
        const id = params.id as string | undefined;
        const selectedDate = params.selectedDate as string | undefined; // 작성 플로우일 수도 있으니 유지
      
        // ✅ 1) 캘린더에서 온 경우: date/id를 최우선으로 넘김
        if (id) {
          router.push({ pathname: '/record/step5', params: { id } } as any);
          return;
        }
        if (date) {
          router.push({ pathname: '/record/step5', params: { date } } as any);
          return;
        }
      
        // ✅ 2) 기존 작성 플로우: selectedDate 유지
        router.replace({
            pathname: '/record/step5',
            params: {
              ...(selectedDate ? { selectedDate } : {}),
              ...(localId ? { localId } : {}),
              ...(dreamId ? { dreamId: String(dreamId) } : {}),
            },
          } as any);        
    };      

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
            {/* 우측 상단 건너뛰기 */}
            <View style={styles.header}> 
                <View />
                <Pressable onPress={handleSkip}>
                    <Text style={[styles.skipText, {marginRight: 16}]}>건너뛰기</Text>
                </Pressable>
            </View>

            {/* 중앙 콘텐츠 */}
            <View style={styles.centerContent}>
                {/* 캐릭터 클릭 전 */}
                {/* 삭제됨 */}
                {/* 영상 재생 중 */}
                {/* ✅ 실제 영상 */}
                <View style={styles.videoWrapper}>
                    {videoUrl ? (
                        <Video
                        source={{ uri: videoUrl }}
                        style={styles.video}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        useNativeControls
                        onError={(e) => console.log('Video error:', e)}
                        onLoad={() => console.log('Video loaded')}
                        />
                    ) : (
                        <Text style={{ color: colors.inactive }}>영상 불러오는 중...</Text>
                    )}
                </View>
            </View>
            {/* 하단 버튼: 영상 끝난 후에만 표시 */}
            {showNextButton && (
                <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}> 
                    <Pressable
                        onPress={handleNext}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>다음</Text>
                    </Pressable>
                </View>
            )}
            </View>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    videoWrapper: {
        width: screenWidth - 40,
        aspectRatio: 16 / 9,       // 박스를 영상 비율로 고정
        backgroundColor: 'transparent',
        borderRadius: 12,
        overflow: 'hidden',
      },
    header: {
        position: 'absolute',
        top: 64,
        left: 16,
        width: 380,
        height: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: 1,
        zIndex: 10,
        paddingRight: 16,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    characterBox: {
        marginBottom: 40,
        alignItems: 'center',
    },
    characterCircle: {
        width: Math.min(120, Math.round(screenWidth * 0.3)),
        height: Math.min(120, Math.round(screenWidth * 0.3)),
        borderRadius: 60,
        backgroundColor: '#87CEEB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    characterPlaceholder: {
        fontSize: 60,
    },
    mainText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 28,
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
    videoText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
    },
    video: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
});