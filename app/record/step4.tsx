import { useRouter, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
// 영상 컴포넌트 임포트
// 실제 프로젝트에서는 'react-native-video' 설치 필요
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

export default function RecordStep5Screen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;

    const [isPlaying, setIsPlaying] = useState(true);
    const [showNextButton, setShowNextButton] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNextButton(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleSkip = () => {
        setShowNextButton(true);
    };

    const handleNext = () => {
        router.push('/(tabs)' as any);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
            {/* 우측 상단 건너뛰기 */}
            <View style={styles.header}> 
                <View />
                <Pressable onPress={handleSkip}>
                    <Text style={styles.skipText}>건너뛰기</Text>
                </Pressable>
            </View>

            {/* 중앙 콘텐츠 */}
            <View style={styles.centerContent}>
                {/* 캐릭터 클릭 전 */}
                {/* 삭제됨 */}
                {/* 영상 재생 중 */}
                <Text style={styles.videoText}>
                    AI 영상 재생
                </Text>

               
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