import AppModal from '@/components/app/AppModal';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useAppDialog } from '@/contexts/AppDialogContext';
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
// 3) videoUrl이 있으면 영상을 보여주고, 저장하기로 갤러리에 저장할 수 있다
export default function RecordStep4Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showDialog } = useAppDialog();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);

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

    const handleSave = () => {
        setIsSaveModalVisible(true);
    };

    const handleSaveVideo = async () => {
        try {
            if (!videoUrl) {
                showDialog({ title: '영상 없음', message: '아직 저장할 꿈 영상이 없습니다.' });
                return;
            }

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                showDialog({ title: '권한 필요', message: '영상을 저장하려면 갤러리 접근 권한이 필요합니다.' });
                return;
            }

            setIsSaveModalVisible(false);
            await MediaLibrary.saveToLibraryAsync(videoUrl);
            showDialog({ title: '저장 완료', message: '영상이 갤러리에 저장되었습니다.' });
        } catch (error) {
            console.error('영상 저장 오류:', error);
            showDialog({ title: '오류', message: '영상 저장에 실패했습니다.' });
        }
    };

    const handleNext = () => {
        const date = params.date as string | undefined;
        const id = params.id as string | undefined;
        const selectedDate = params.selectedDate as string | undefined; // 작성 플로우일 수도 있으니 유지
      
        // ✅ 1) 캘린더에서 온 경우: date/id를 최우선으로 넘김
        if (id) {
          router.push({ pathname: '/record/step5', params: { mode: 'review', id } } as any);
          return;
        }
        if (date) {
          router.push({ pathname: '/record/step5', params: { mode: 'review', date } } as any);
          return;
        }
      
        // ✅ 2) 기존 작성 플로우: selectedDate 유지
        router.replace({
            pathname: '/record/step5',
            params: {
              mode: 'record',
              ...(selectedDate ? { selectedDate } : {}),
              ...(localId ? { localId } : {}),
              ...(dreamId ? { dreamId: String(dreamId) } : {}),
            },
          } as any);        
    };      

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
            <View style={styles.header}> 
                <View />
                <Pressable onPress={handleSave}>
                    <Text style={styles.saveText}>저장하기</Text>
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
                        <Text style={styles.loadingText}>영상 불러오는 중...</Text>
                    )}
                </View>
            </View>

            <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}> 
                <Pressable
                    onPress={handleNext}
                    style={styles.nextButton}
                >
                    <Text style={styles.nextButtonText}>다음</Text>
                </Pressable>
            </View>

            <AppModal
                visible={isSaveModalVisible}
                title="영상을 저장하시겠습니까?"
                message="현재 꿈 영상을 갤러리에 저장할 수 있습니다."
                buttons={[
                    { text: '닫기', style: 'cancel', onPress: () => setIsSaveModalVisible(false) },
                    { text: '영상 저장', onPress: handleSaveVideo },
                ]}
                onClose={() => setIsSaveModalVisible(false)}
            />
            </SafeAreaView>
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
        backgroundColor: '#000000',
        borderRadius: 12,
        overflow: 'hidden',
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
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 120,
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
    loadingText: {
        fontSize: 14,
        color: colors.inactive,
        textAlign: 'center',
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
