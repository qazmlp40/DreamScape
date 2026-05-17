import FixedBottomButton from '@/components/app/FixedBottomButton';
import RecordHeader from '@/components/app/RecordHeader';
import SaveConfirmModal from '@/components/app/SaveConfirmModal';
import { useAppDialog } from '@/contexts/AppDialogContext';
import { dreamApi } from '@/services/dreamApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const colors = {
    text: '#1F2937',
    background: '#FFFFFF',
    border: '#E5E7EB',
    buttonColor: '#BB7CFF',
    inactive: '#9CA3AF',
    purple: '#BB7CFF',
};

const DREAM_VIDEO_FEEDBACK_STORAGE_KEY = 'dreamVideoFeedback';

const getParamValue = (value: unknown) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return typeof value === 'string' && value.trim() ? value : undefined;
};

const getParamNumber = (value: unknown) => {
    const rawValue = getParamValue(value);
    if (!rawValue) {
        return undefined;
    }

    const numberValue = Number(rawValue);
    return Number.isFinite(numberValue) ? numberValue : undefined;
};

export default function RecordStep4Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showDialog } = useAppDialog();

    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [hasTimerElapsed, setHasTimerElapsed] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [feedbackReason, setFeedbackReason] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [videoReloadKey, setVideoReloadKey] = useState(0);

    const dreamIdParam = getParamValue(params.dreamId) ?? getParamValue(params.id);
    const dreamId = getParamNumber(dreamIdParam);
    const localId = getParamValue(params.localId) ?? null;
    const remoteDreamId = getParamValue(params.id) ?? null;
    const selectedDate = getParamValue(params.selectedDate) ?? null;
    const dateParam = getParamValue(params.date) ?? null;
    const videoUrlParam = getParamValue(params.videoUrl) ?? null;
    const mode = getParamValue(params.mode); // review mode
    const isReviewMode = mode === "review";


    useEffect(() => {
        setHasTimerElapsed(false);
        setIsRatingModalVisible(false);
        setSelectedRating(0);
        setFeedbackReason('');
    }, [dreamIdParam, localId, remoteDreamId]);

    useEffect(() => {
        let isCancelled = false;

        const loadVideo = async () => {
            setVideoError(null);
            setResolvedVideoUrl(null);
            console.log("[Step4] loadVideo start:", {
                dreamId,
                videoUrlParam,
                mode,
                isReviewMode,
            });

            if (videoUrlParam) {
                console.log("[Step4] videoUrlParam으로 기존 영상 재생:", videoUrlParam);
                setResolvedVideoUrl(videoUrlParam);
                setIsVideoLoading(false);
                return;
            }

            // 리뷰 모드일 땐 영상 재생성 안되게 함
            if (isReviewMode) {
                console.log("[Step4] review mode + videoUrl 없음: 영상 재생성 중단");
                setVideoError('저장된 영상이 없습니다.');
                setIsVideoLoading(false);
                return;
              }              

            if (!dreamId) {
                setVideoError('꿈 정보를 찾지 못했어요.');
                setIsVideoLoading(false);
                return;
            }

            setIsVideoLoading(true);

            try {
                console.log("[Step4] generateVideo 요청:", { dreamId });
                const videoRes = await dreamApi.generateVideo(dreamId);
                console.log("[Step4] generateVideo 응답:", videoRes);
                const responseDreamId = getParamNumber(
                    videoRes?.dreamId ?? videoRes?.id ?? videoRes?.dream_id,
                );
                const isMismatchedVideo =
                    responseDreamId !== undefined && responseDreamId !== dreamId;

                if (isMismatchedVideo) {
                    console.warn('꿈 영상 응답의 dreamId가 현재 꿈과 달라서 무시합니다.', {
                        expectedDreamId: dreamId,
                        responseDreamId,
                    });
                    throw new Error('다른 꿈의 영상 응답을 받았습니다.');
                }

                const nextVideoUrl = videoRes?.mediaUrl ?? videoRes?.videoUrl;

                if (!nextVideoUrl) {
                    throw new Error('영상 URL이 없습니다.');
                }

                if (!isCancelled) {
                    setResolvedVideoUrl(nextVideoUrl);
                }
            } catch (error) {
                console.error('꿈 영상 불러오기 실패:', error);
                if (!isCancelled) {
                    setVideoError('꿈 영상을 불러오지 못했어요.');
                }
            } finally {
                if (!isCancelled) {
                    setIsVideoLoading(false);
                }
            }
        };

        loadVideo();

        return () => {
            isCancelled = true;
        };
    }, [dreamId, videoUrlParam, videoReloadKey, isReviewMode]);

    const showRatingModal = () => {
        setHasTimerElapsed(true);
        setIsRatingModalVisible(true);
    };

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
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={styles.videoWrapper}>
                        {resolvedVideoUrl ? (
                            <Video
                                source={{ uri: resolvedVideoUrl as string }}
                                style={styles.video}
                                resizeMode={ResizeMode.CONTAIN}
                                shouldPlay
                                rate={0.5}
                                shouldCorrectPitch
                                onPlaybackStatusUpdate={(status) => {
                                    if (
                                        status.isLoaded &&
                                        status.didJustFinish &&
                                        !hasTimerElapsed
                                    ) {
                                        showRatingModal();
                                    }
                                }}
                            />
                        ) : videoError ? (
                            <View style={styles.videoStateCard}>
                                <Text style={styles.videoStateTitle}>{videoError}</Text>
                                <Text style={styles.videoStateMessage}>
                                    잠시 후 다시 시도해주세요.
                                </Text>
                                <Pressable
                                    style={styles.retryButton}
                                    onPress={() => {
                                        setVideoError(null);
                                        setResolvedVideoUrl(null);
                                        setVideoReloadKey((key) => key + 1);
                                    }}
                                >
                                    <Text style={styles.retryButtonText}>다시 시도</Text>
                                </Pressable>
                                <View style={styles.errorActions}>
                                    <Pressable
                                        style={styles.errorSecondaryButton}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={styles.errorSecondaryButtonText}>뒤로가기</Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.errorSecondaryButton}
                                        onPress={() => router.replace('/(tabs)')}
                                    >
                                        <Text style={styles.errorSecondaryButtonText}>홈으로</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.loadingCard}>
                                <Text style={styles.loadingTitle}>꿈 영상을 불러오는 중이에요</Text>
                                <Text style={styles.loadingText}>영상을 생성하고 있어요. 잠시만 기다려주세요</Text>
                            </View>
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
                    <View style={styles.overlayControls}>
                        <RecordHeader
                            showBack={false}
                            rightText="저장하기"
                            onRightPress={handleSave}
                            variant="overlay"
                        />

                        <FixedBottomButton
                            label="다음"
                            onPress={navigateToHome}
                            overlay
                        />
                    </View>
                ) : null}

                <SaveConfirmModal
                    visible={isSaveModalVisible}
                    kind="video"
                    onSave={handleSaveVideo}
                    onClose={() => setIsSaveModalVisible(false)}
                />
            </View>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.4,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 10,
        textAlign: 'center',
    },
    videoStateCard: {
        width: '100%',
        maxWidth: 320,
        minHeight: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    videoStateTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    videoStateMessage: {
        marginTop: 6,
        fontSize: 13,
        color: colors.inactive,
        lineHeight: 18,
        textAlign: 'center',
    },
    retryButton: {
        height: 40,
        marginTop: 18,
        borderRadius: 8,
        backgroundColor: colors.buttonColor,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    errorActions: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 10,
        width: '100%',
    },
    errorSecondaryButton: {
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorSecondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
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
    overlayControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    },
});
