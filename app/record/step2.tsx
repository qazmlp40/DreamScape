import { API_BASE_URL } from '@/constants/api';
import { dreamApi } from '@/services/dreamApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions, Image, StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDreamRecord } from '../../contexts/DreamRecordContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// 캘린더 - rawtext 추가

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F3F4F6',
    border: '#E5E7EB',
    inactive: '#9CA3AF',
};

    // [step 2 - 분석 중 ... 화면]
    // 1. step 1에서 전달받은 dreamId 기준으로 요약/ 해몽 API 호출 
    // 2. 분석 결과(summary / interpretation / tags)를 Contexet에 저장
    // ※ 영상 생성은 Step4에서 따로 처리함
export default function RecordStep2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    // const { dreamText = '', setAnalysis, setVideoUrl } = useDreamRecord();
    const [isLoading, setIsLoading] = useState(true);

    const {
      currentDreamText: contextDreamText = '', // Context에 임시 저장된 꿈 내용
      setAnalysis, // summary, interpretation, tags 저장
    } = useDreamRecord();
    
    const dreamTextParam = // Step1에서 URL params로 넘겨준 꿈 내용
      typeof params.dreamText === 'string'
        ? decodeURIComponent(params.dreamText)
        : '';
    
    const finalDreamText = contextDreamText || dreamTextParam || ''; // Step2에서 실제로 사용할 최종 꿈 내용
   // step2에서는 받아온 꿈 텍스트를 바로 쓰지 말고, context값 + params값 중 살아있는 걸 합친 finalDreamText를 최종 사용한다

    // ** 수정 전 원래 코드
    // useEffect(() => {
    //     const fetchAnalysis = async () => {
    //         if (!dreamText) {
    //             // 꿈 텍스트가 없으면 3초 후 다음 화면으로
    //             setTimeout(() => {
    //                 const selectedDate = params.selectedDate as string;
    //                 router.push(`/record/step3${selectedDate ? `?selectedDate=${selectedDate}` : ''}` as any);
    //             }, 3000);
    //             return;
    //         }

    //         try {
    //             setIsLoading(true);
    //             const result = await dreamApi.interpretDream(dreamText);
                
    //             // 백엔드 응답: { aiSummary: string, dreamId: number }
    //             setAnalysis({
    //                 summary: result.aiSummary ?? dreamText,
    //                 interpretation: '',
    //                 tags: [],
    //             });
    //         } catch (error) {
    //             console.error('Analysis error:', error);
    //             // 실패 시 원본 텍스트 사용
    //             setAnalysis({
    //                 summary: dreamText,
    //                 interpretation: '',
    //                 tags: [],
    //             });
    //         } finally {
    //             setIsLoading(false);
    //             // API 응답 후 다음 화면으로
    //             const selectedDate = params.selectedDate as string;
    //             router.push(`/record/step3${selectedDate ? `?selectedDate=${selectedDate}` : ''}` as any);
    //         }
    //     };

    //     fetchAnalysis();
    // }, [dreamText, params.selectedDate]);

    useEffect(() => {
        const run = async () => {
          const dreamIdParam = params.dreamId;
          const dreamId = typeof dreamIdParam === 'string' ? Number(dreamIdParam) : NaN;

          console.log('[Step2] API_BASE_URL:', API_BASE_URL);
          console.log('[Step2] dreamIdParam:', dreamIdParam, '->', dreamId);
          console.log('[Step2] finalDreamText:', finalDreamText);

          if (!dreamId || Number.isNaN(dreamId)) {
            console.error('dreamId가 없습니다.');
            return;
          }
      
          try {
            setIsLoading(true);
      
            // 요약 / 해몽을 동시에 요청
            //  summarizeDream: dreamId의 aiSummary를 DB에 저장
            //  interpretDream: dreamId 기준 해몽 결과 반환
            const [summarizeResult, interpretResult] = await Promise.allSettled([
              dreamApi.summarizeDream(dreamId, finalDreamText),
              dreamApi.interpretDream(dreamId),
            ]);

            let summary = finalDreamText ?? '';
            let interpretation = '';
            let tags: string[] = [];

            // ✅ 요약 처리
            if (summarizeResult.status === 'fulfilled') {
              const summarizeRes = summarizeResult.value;
              console.log('[Step2] dreamApi.summarizeDream 응답:', summarizeRes);

              summary =
                summarizeRes.aiSummary ??
                summarizeRes.summary ??
                finalDreamText ??
                '';
            } else {
              console.log(
                'summarize failed:',
                summarizeResult.reason?.response?.status,
                summarizeResult.reason?.response?.data
              );
            }
      
            // ✅ 해몽 처리
            if (interpretResult.status === 'fulfilled') {
              const interpretRes = interpretResult.value;
              console.log('[Step2] dreamApi.interpretDream 응답:', interpretRes);
              
              interpretation = interpretRes.aiInterpretation ?? '';
              tags = interpretRes.tags ?? [];
            } else {
              console.log(
                'interpret failed:',
                interpretResult.reason?.response?.status,
                interpretResult.reason?.response?.data
              );
            }

            // ✅ 분석 결과를 Context에 저장
            setAnalysis({
              summary,
              interpretation,
              tags,
            });
      
          //   // ✅ 영상 처리
          //   if (videoResult.status === 'fulfilled') {
          //     const videoRes = videoResult.value;
          //     console.log('dreamApi.generateVideo 응답:', videoRes);
          //     setVideoUrl(videoRes.mediaUrl ?? '');
          //   } else {
          //     console.log(
          //       'video failed:',
          //       videoResult.reason?.response?.status,
          //       videoResult.reason?.response?.data
          //     );
          //     setVideoUrl(null); // 또는 ''
          //   }
          // } catch (e) {
          //   console.error('제작 중 오류:', e);)
          } finally {
            setIsLoading(false);
            const selectedDate = params.selectedDate as string | undefined;

            router.push(
              `/record/step3?dreamId=${dreamId}${
                selectedDate ? `&selectedDate=${selectedDate}` : ''
              }` as any
            );
          }
        };
      
        run();
      }, [params.dreamId, params.selectedDate, finalDreamText]);

    return (
        <View style={styles.container}>
            {/* 중앙 콘텐츠 */}
            <View style={styles.centerContent}>
                {/* 캐릭터 박스 */}
                <View style={styles.characterBox}>
                    <Image
                        source={require('../../assets/images/icons/making_image.png')}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>

                {/* 분석 중 텍스트 */}
                <View style={styles.loadingSection}>
                    <Text style={styles.loadingText}>분석 중...</Text>
                    <ActivityIndicator 
                        size="large" 
                        color={colors.inactive} 
                        style={styles.spinner}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    characterBox: {
        width: Math.min(200, Math.round(screenWidth * 0.5)),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    characterPlaceholder: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.inactive,
    },
    characterSubText: {
        fontSize: 12,
        color: colors.inactive,
        marginTop: 8,
    },
    loadingSection: {
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 20,
    },
    spinner: {
        marginTop: 10,
    },
});