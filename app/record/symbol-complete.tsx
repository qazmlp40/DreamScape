import DreamSymbolIcon from '@/components/app/DreamSymbolIcon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    accentText: '#A56EFF',
    inactive: '#9CA3AF',
};

const SYMBOL_SIZE = 132;

const getParamValue = (value: unknown) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return typeof value === 'string' && value.trim() ? value : undefined;
};

// [symbol-complete - 키워드 기반 아이콘 화면]
// analysis-loading에서 전달받은 dreamId, localId를 유지한 채
// 사용자가 캐릭터를 누르면 해몽 결과 화면으로 이동한다
export default function SymbolCompleteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    
    const dreamId = getParamValue(params.dreamId);
    const localId = getParamValue(params.localId);
    const mood = getParamValue(params.mood);
    const selectedDate = getParamValue(params.selectedDate);
    const title = getParamValue(params.title);
    const summary = getParamValue(params.summary);
    const interpretation = getParamValue(params.interpretation);
    const dreamText = getParamValue(params.dreamText);
    const tags = getParamValue(params.tags)
        ?.split(',')
        .map((tag: string) => tag.trim())
        .filter(Boolean) ?? [];
    const symbolText = [title, summary, interpretation, dreamText].filter(Boolean).join(' ');

    // 캐릭터 박스 클릭 시 해몽 화면으로 이동
    const handleCharacterClick = () => {
        router.replace({
            pathname: '/record/result-view',
	            params: {
	                mode: 'record',
                ...(dreamId ? { id: dreamId, dreamId } : {}),
                ...(localId ? { localId } : {}),
                ...(mood ? { mood } : {}),
                ...(title ? { title } : {}),
                ...(summary ? { summary } : {}),
                ...(interpretation ? { interpretation } : {}),
                ...(dreamText ? { dreamText } : {}),
                ...(tags.length ? { tags: tags.join(',') } : {}),
                ...(selectedDate ? { selectedDate } : {}),
            },
	        } as any);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}> 
            <View style={styles.centerWrapper}>
                <TouchableOpacity
                    style={styles.characterBox}
                    activeOpacity={0.8}
                    onPress={handleCharacterClick}
                >
                    <DreamSymbolIcon
                        tags={tags}
                        text={symbolText}
                        width={SYMBOL_SIZE}
                        height={SYMBOL_SIZE}
                    />
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
        width: SYMBOL_SIZE,
        height: SYMBOL_SIZE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
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
        fontWeight: '700',
        color: colors.accentText,
        marginBottom: 10,
        textAlign: 'center',
    },
    completeSubtitle: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
        color: colors.inactive,
        textAlign: 'center',
    },
});
