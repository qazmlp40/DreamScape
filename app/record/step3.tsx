import Pigicon from '@/assets/images/icons/dream_symbol/pig.svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
};

// [step 3 - 키워드 기반 아이콘 화면]
// step 2에서 전달받은 dreamId로 AI 영상 생성 요청 
// videoUrl을 Context에 저장
export default function RecordStep4Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    
    const dreamId = params.dreamId as string | undefined;

    // 캐릭터 박스 클릭 시 다음 페이지로 이동
    const handleCharacterClick = () => {
        const selectedDate = params.selectedDate as string;
        router.push(
            `/record/step4?dreamId=${dreamId}${
              selectedDate ? `&selectedDate=${selectedDate}` : ''
            }` as any
        )      
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}> 
            <View style={styles.centerWrapper}>
                <TouchableOpacity
                    style={styles.characterBox}
                    activeOpacity={0.8}
                    onPress={handleCharacterClick}
                >
                    <Pigicon />
                </TouchableOpacity>

                <Text style={styles.completeTitle}>완성 !</Text>
                <Text style={styles.completeSubtitle}>캐릭터를 클릭해 확인해보세요!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        right: 20,
        zIndex: 10,
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
    },
    mainText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 28,
    },
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    characterBox: {
        width: 142,
        height: 142,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    characterPlaceholder: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    characterSubText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    completeTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    completeSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
});