import AppModal from '@/components/app/AppModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDialog } from '@/contexts/AppDialogContext';

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    border: '#E5E7EB',
    buttonColor: '#BB7CFF',
    inactive: '#9CA3AF',
    purple: '#BB7CFF',
};

const FIXED_BUTTON_HEIGHT = 56;
const DREAM_VIDEO_FEEDBACK_STORAGE_KEY = 'dreamVideoFeedback';

export default function RecordStep4Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showDialog } = useAppDialog();
    const insets = useSafeAreaInsets();
    const BOTTOM_INSET = insets.bottom || 20;

    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [hasTimerElapsed, setHasTimerElapsed] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [feedbackReason, setFeedbackReason] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const dreamIdParam = params.dreamId;
    const dreamId = typeof dreamIdParam === 'string' ? Number(dreamIdParam) : NaN;
    const localId = typeof params.localId === 'string' ? params.localId : null;
    const remoteDreamId = typeof params.id === 'string' ? params.id : null;
    const selectedDate = typeof params.selectedDate === 'string' ? params.selectedDate : null;
    const dateParam = typeof params.date === 'string' ? params.date : null;
    const videoUrlParam =
        typeof params.videoUrl === 'string' && params.videoUrl.trim()
            ? params.videoUrl
            : null;

    useEffect(() => {
        setHasTimerElapsed(false);
        setIsRatingModalVisible(false);
        setSelectedRating(0);
        setFeedbackReason('');

        const timer = setTimeout(() => {
            setHasTimerElapsed(true);
            setIsRatingModalVisible(true);
        }, 6000);

        return () => clearTimeout(timer);
    }, [dreamIdParam, localId, remoteDreamId]);

    const navigateToHome = () => {
        setIsRatingModalVisible(false);
        router.replace('/(tabs)');
    };

    const handleSave = () => {
        setIsSaveModalVisible(true);
    };

    const handleSaveVideo = async () => {
        try {
            setIsSaveModalVisible(false);
            showDialog({ title: '안내', message: '목 버전에서는 영상 저장 기능이 아직 비활성화되어 있어요.' });
        } catch (error) {
            console.error('영상 저장 오류:', error);
            showDialog({ title: '오류', message: '영상 저장에 실패했습니다.' });
        }
    };

    const handleSkipRating = () => {
        setSelectedRating(0);
        setFeedbackReason('');
        navigateToHome();
    };

    const handleSubmitRating = async () => {
        if (!selectedRating || isSubmittingFeedback) {
            return;
        }

        setIsSubmittingFeedback(true);

        try {
            const storedFeedback = await AsyncStorage.getItem(
                DREAM_VIDEO_FEEDBACK_STORAGE_KEY,
            );
            const feedbackList = storedFeedback ? JSON.parse(storedFeedback) : [];

            feedbackList.push({
                dreamId: Number.isFinite(dreamId) ? dreamId : null,
                remoteDreamId,
                localId,
                date: dateParam ?? selectedDate ?? null,
                rating: selectedRating,
                reason: feedbackReason.trim(),
                createdAt: new Date().toISOString(),
            });

            await AsyncStorage.setItem(
                DREAM_VIDEO_FEEDBACK_STORAGE_KEY,
                JSON.stringify(feedbackList),
            );

            navigateToHome();
        } catch (error) {
            console.error('꿈 영상 평가 저장 실패:', error);
            showDialog({
                title: '오류',
                message: '평가를 저장하지 못했어요. 잠시 후 다시 시도해주세요.',
            });
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={styles.videoWrapper}>
                        {videoUrlParam ? (
                            <Video
                                source={{ uri: videoUrlParam }}
                                style={styles.video}
                                resizeMode={ResizeMode.COVER}
                                shouldPlay
                                isLooping
                                rate={0.5}
                                shouldCorrectPitch
                            />
                        ) : (
                            <>
                                <Image
                                    source={require('../../assets/images/icons/making_image.png')}
                                    style={styles.mockImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.loadingText}>꿈 영상을 만드는 중...</Text>
                            </>
                        )}
                    </View>
                </View>

                <Modal
                    visible={isRatingModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={handleSkipRating}
                >
                    <View style={styles.ratingOverlay}>
                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingTitle}>
                                꿈 영상이 실제 꿈과 얼마나 비슷했나요?
                            </Text>
                            <Text style={styles.ratingSubtitle}>
                                한 번의 평가가 DreamScape 개선에 큰 도움이 돼요.
                            </Text>

                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = star <= selectedRating;

                                    return (
                                        <Pressable
                                            key={star}
                                            style={styles.starButton}
                                            onPress={() => setSelectedRating(star)}
                                        >
                                            <Text
                                                style={[
                                                    styles.starText,
                                                    isActive ? styles.starTextActive : null,
                                                ]}
                                            >
                                                ★
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <Text style={styles.ratingCaption}>
                                {selectedRating
                                    ? `${selectedRating}점으로 평가했어요`
                                    : '1점에서 5점 사이로 선택해주세요'}
                            </Text>

                            {selectedRating > 0 && selectedRating <= 3 ? (
                                <View style={styles.reasonSection}>
                                    <Text style={styles.reasonLabel}>
                                        아쉬웠던 점이 있다면 알려주세요
                                    </Text>
                                    <TextInput
                                        value={feedbackReason}
                                        onChangeText={setFeedbackReason}
                                        placeholder="예: 꿈 내용과 장면 흐름이 조금 달랐어요."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        maxLength={200}
                                        style={styles.reasonInput}
                                        textAlignVertical="top"
                                    />
                                </View>
                            ) : null}

                            <View style={styles.ratingActions}>
                                <Pressable
                                    style={styles.ratingSkipButton}
                                    onPress={handleSkipRating}
                                >
                                    <Text style={styles.ratingSkipButtonText}>건너뛰기</Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.ratingSubmitButton,
                                        !selectedRating || isSubmittingFeedback
                                            ? styles.ratingSubmitButtonDisabled
                                            : null,
                                    ]}
                                    onPress={handleSubmitRating}
                                    disabled={!selectedRating || isSubmittingFeedback}
                                >
                                    <Text style={styles.ratingSubmitButtonText}>
                                        {isSubmittingFeedback ? '저장 중...' : '제출하고 이동'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {hasTimerElapsed && !isRatingModalVisible ? (
                    <>
                        <View style={[styles.headerOverlay, { top: insets.top + 8 }]}>
                            <View />
                            <Pressable onPress={handleSave}>
                                <Text style={styles.saveText}>저장하기</Text>
                            </Pressable>
                        </View>

                        <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}>
                            <Pressable
                                onPress={navigateToHome}
                                style={styles.nextButton}
                            >
                                <Text style={styles.nextButtonText}>다음</Text>
                            </Pressable>
                        </View>
                    </>
                ) : null}

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
        backgroundColor: '#000000',
    },
    centerContent: {
        flex: 1,
        backgroundColor: '#000000',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    mockImage: {
        width: 220,
        height: 220,
    },
    loadingText: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 20,
    },
    headerOverlay: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        elevation: 10,
    },
    saveText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.36,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 10,
        elevation: 10,
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
    ratingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    ratingCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    ratingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 28,
    },
    ratingSubtitle: {
        marginTop: 10,
        fontSize: 14,
        color: colors.inactive,
        textAlign: 'center',
        lineHeight: 20,
    },
    starRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    starButton: {
        padding: 4,
    },
    starText: {
        fontSize: 38,
        color: '#D1D5DB',
    },
    starTextActive: {
        color: '#FACC15',
    },
    ratingCaption: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: colors.purple,
        textAlign: 'center',
    },
    reasonSection: {
        marginTop: 20,
    },
    reasonLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    reasonInput: {
        minHeight: 92,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.text,
        backgroundColor: '#F9FAFB',
    },
    ratingActions: {
        marginTop: 20,
        gap: 10,
    },
    ratingSkipButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingSkipButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    ratingSubmitButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: colors.buttonColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingSubmitButtonDisabled: {
        backgroundColor: '#D8B4FE',
    },
    ratingSubmitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
