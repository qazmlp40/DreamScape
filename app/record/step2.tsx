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
import { dreamApi } from '@/services/dreamApi';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F3F4F6',
    border: '#E5E7EB',
    inactive: '#9CA3AF',
};

export default function RecordStep2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { dreamText, setAnalysis } = useDreamRecord();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!dreamText) {
                // 꿈 텍스트가 없으면 3초 후 다음 화면으로
                setTimeout(() => {
                    const selectedDate = params.selectedDate as string;
                    router.push(`/record/step3${selectedDate ? `?selectedDate=${selectedDate}` : ''}` as any);
                }, 3000);
                return;
            }

            try {
                setIsLoading(true);
                const result = await dreamApi.analyzeDream(dreamText);
                
                // 백엔드 응답: { aiSummary: string, dreamId: number }
                setAnalysis({
                    summary: result.aiSummary ?? dreamText,
                    interpretation: '',
                    tags: [],
                });
            } catch (error) {
                console.error('Analysis error:', error);
                // 실패 시 원본 텍스트 사용
                setAnalysis({
                    summary: dreamText,
                    interpretation: '',
                    tags: [],
                });
            } finally {
                setIsLoading(false);
                // API 응답 후 다음 화면으로
                const selectedDate = params.selectedDate as string;
                router.push(`/record/step3${selectedDate ? `?selectedDate=${selectedDate}` : ''}` as any);
            }
        };

        fetchAnalysis();
    }, [dreamText, params.selectedDate]);

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

                {/* 제작 중 텍스트 */}
                <View style={styles.loadingSection}>
                    <Text style={styles.loadingText}>제작 중...</Text>
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