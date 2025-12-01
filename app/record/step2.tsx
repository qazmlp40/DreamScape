import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F3F4F6',
    border: '#E5E7EB',
    inactive: '#9CA3AF',
};

export default function RecordStep3Screen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 3초 후 자동으로 다음 화면으로 이동
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/record/step3' as any);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* 중앙 콘텐츠 */}
            <View style={styles.centerContent}>
                {/* 캐릭터 박스 */}
                <View style={styles.characterBox}>
                    <Text style={styles.characterPlaceholder}>꿈 상징 캐릭터</Text>
                    <Text style={styles.characterSubText}>제작 중 이미지</Text>
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
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    characterBox: {
        width: Math.min(200, Math.round(screenWidth * 0.5)),
        height: Math.min(200, Math.round(screenWidth * 0.5)),
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
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
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 20,
    },
    spinner: {
        marginTop: 10,
    },
});