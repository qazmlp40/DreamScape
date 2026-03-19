import { API_BASE_URL } from '@/constants/api';
import { dreamApi } from '@/services/dreamApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// [step 2 - 분석 중... 화면]
// 1) Step1에서 전달받은 dreamId로 요약/해몽 API를 호출한다
// 2) 분석 결과(summary / interpretation / tags)를 Context와 local record에 저장한다
// 3) 분석이 끝나면 Step3로 이동한다
// ※ 영상 생성은 summary 기반이므로 Step4에서 요청한다
export default function RecordStep2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    // const { dreamText = '', setAnalysis, setVideoUrl } = useDreamRecord();
    const [isLoading, setIsLoading] = useState(true);
    const hasRunRef = useRef(false);

    const {
      currentDreamText: contextDreamText = '', // Context에 임시 저장된 꿈 내용
      setAnalysis, // summary, interpretation, tags 저장
      updateRecordByLocalId,
    } = useDreamRecord();
    
    const dreamTextParam = // Step1에서 URL params로 넘겨준 꿈 내용
      typeof params.dreamText === 'string'
        ? decodeURIComponent(params.dreamText)
        : '';
    
    const finalDreamText = contextDreamText || dreamTextParam || ''; // Step2에서 실제로 사용할 최종 꿈 내용
   // step2에서는 받아온 꿈 텍스트를 바로 쓰지 말고, context값 + params값 중 살아있는 걸 합친 finalDreamText를 최종 사용한다

    useEffect(() => {
      if (hasRunRef.current) return;
      hasRunRef.current = true;    
        const run = async () => {
          const dreamIdParam = params.dreamId;
          const dreamId = typeof dreamIdParam === 'string' ? Number(dreamIdParam) : NaN;
          const localIdParam = params.localId;
          const localId = typeof localIdParam === 'string' ? localIdParam : '';

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
            if (localId) {
              updateRecordByLocalId(localId, {
                dreamId,
                analysis: {
                  summary,
                  interpretation,
                  tags,
                },
              });
              console.log('[Step2] local record에 dreamId/analysis 연결 완료:', {
                localId,
                dreamId,
              });
            } else {
              console.warn('[Step2] localId가 없어서 record 연결 불가');
            }
          } finally {
            setIsLoading(false);
            const selectedDate = params.selectedDate as string | undefined;

            router.replace(
              `/record/step3?dreamId=${dreamId}&localId=${localId}${
                selectedDate ? `&selectedDate=${selectedDate}` : ''
              }` as any
            );
          }
        };
      
        run();
      }, [params.dreamId, params.localId]);

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