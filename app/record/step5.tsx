import AppModal from "@/components/app/AppModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ResizeMode, Video } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { API_BASE_URL, DEV_MOCK_DREAMS } from "../../constants/api";
import { useAppDialog } from "../../contexts/AppDialogContext";
import { useDreamRecord } from "../../contexts/DreamRecordContext";
import { dreamApi, getMockDreamById } from "../../services/dreamApi";
import IMAGES from "../assets/images";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F3F4F6",
  border: "#E5E7EB",
  buttonColor: "#BB7CFF",
  purple: "#BB7CFF",
  purpleLight: "#F3E8FF",
  inactive: "#9CA3AF",
};

const FIXED_BUTTON_HEIGHT = 56;
const DREAM_VIDEO_FEEDBACK_STORAGE_KEY = "dreamVideoFeedback";

const MOODS = [
  { id: "1", name: "행복함", image: IMAGES.happy_icon },
  { id: "2", name: "슬픔", image: IMAGES.sad_icon },
  { id: "3", name: "분노", image: IMAGES.anger_icon },
  { id: "4", name: "흥분", image: IMAGES.excitement_icon },
  { id: "5", name: "감동", image: IMAGES.impressed_icon },
  { id: "6", name: "공포", image: IMAGES.scared_icon },
  { id: "7", name: "알 수 없음", image: IMAGES.ambiguous_icon },
];

export default function RecordStep5Screen() {
  const {
    currentRecord,
    resetCurrent,
    getRecordByLocalId,
    getRecordByDate,
    updateRecordByLocalId,
  } = useDreamRecord();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { showDialog } = useAppDialog();
  const insets = useSafeAreaInsets();
  const BOTTOM_INSET = insets.bottom || 20;
  const [isSaved, setIsSaved] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const viewRef = useRef(null);
  const [remoteRecord, setRemoteRecord] = useState<{
    title?: string;
    mood?: string;
    summary?: string;
    interpretation?: string;
    videoUrl?: string;
  } | null>(null);

  useEffect(() => {
    const fetchDream = async () => {
      if (!params.id) {
        setRemoteRecord(null);
        return;
      }

      if (DEV_MOCK_DREAMS) {
        const mockDream = getMockDreamById(Number(params.id));
        setRemoteRecord(
          mockDream
            ? {
                title: mockDream.title,
                mood: mockDream.mood,
                summary: mockDream.aiSummary ?? mockDream.rawText,
                interpretation: mockDream.aiInterpretation,
                videoUrl: mockDream.mediaUrl ?? undefined,
              }
            : null,
        );
        return;
      }

      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/dreams/${params.id}`);
        const data = res.data || {};

        setRemoteRecord({
          title: data.title || data.dreamTitle,
          mood: data.mood || data.emotion,
          summary:
            data.aiSummary ?? data.summary ?? data.rawText ?? data.content,
          interpretation:
            data.aiInterpretation ?? data.interpretation ?? data.analysisText,
          videoUrl: data.mediaUrl ?? data.videoUrl,
        });
      } catch (error) {
        console.error("꿈 데이터 불러오기 실패:", error);
      }
    };

    fetchDream();
  }, [params.id]);

  // ✅ params로 저장된 record 먼저 찾기
  const record =
    (params.localId ? getRecordByLocalId(String(params.localId)) : null) ??
    (params.date ? getRecordByDate(String(params.date)) : null);

  // ✅ record를 먼저 쓰고, 없으면 currentRecord (DreamRecord 타입으로 좁히기)
  const displayRecord:
    | import("../../contexts/DreamRecordContext").DreamRecord
    | null =
    record ??
    (currentRecord.mood
      ? (currentRecord as unknown as import("../../contexts/DreamRecordContext").DreamRecord)
      : null);

  // ✅ 화면에 뿌리는 데이터도 displayRecord 기준으로 통일
  const dreamTitle =
    (remoteRecord?.title && remoteRecord.title.trim()) ||
    (displayRecord?.title && displayRecord.title.trim()) ||
    "";

  const dreamSummary =
    remoteRecord?.summary ??
    displayRecord?.analysis?.summary ??
    displayRecord?.dreamText ??
    "";

  const dreamInterpretation =
    remoteRecord?.interpretation ??
    displayRecord?.analysis?.interpretation ??
    "";

  const selectedMoodId = remoteRecord?.mood ?? displayRecord?.mood ?? "1";
  const selectedMood = MOODS.find(
    (m) => m.id === selectedMoodId || m.name === selectedMoodId,
  );

  const dreamVideoUrl =
    remoteRecord?.videoUrl ?? displayRecord?.videoUrl ?? null;
  const localDreamId = displayRecord?.dreamId;

  useEffect(() => {
    const run = async () => {
      if (!localDreamId || !displayRecord?.localId || dreamVideoUrl) {
        return;
      }

      try {
        const videoRes = await dreamApi.generateVideo(localDreamId);
        updateRecordByLocalId(displayRecord.localId, {
          dreamId: localDreamId,
          videoUrl: videoRes.mediaUrl ?? undefined,
        });
      } catch (error) {
        console.error("꿈 영상 생성 실패:", error);
      }
    };

    run();
  }, [
    dreamVideoUrl,
    displayRecord?.localId,
    localDreamId,
    updateRecordByLocalId,
  ]);

  const handleSave = () => {
    // 서버 저장 X, 모달만 띄우기
    setIsSaved(true);
  };

  const handleNext = () => {
    setIsRatingModalVisible(true);
  };

  const navigateToHome = () => {
    setIsRatingModalVisible(false);
    resetCurrent();
    router.replace("/(tabs)");
  };

  const handleSkipRating = () => {
    setSelectedRating(0);
    setFeedbackReason("");
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
        dreamId: localDreamId ?? null,
        remoteDreamId: params.id ? String(params.id) : null,
        localId: displayRecord?.localId ?? null,
        date: displayRecord?.date ?? (params.date ? String(params.date) : null),
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
      console.error("꿈 영상 평가 저장 실패:", error);
      showDialog({
        title: "오류",
        message: "평가를 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!dreamVideoUrl) {
      showDialog({
        title: "영상 없음",
        message: "아직 저장할 꿈 영상이 없습니다.",
      });
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showDialog({
          title: "권한 필요",
          message: "영상을 저장하려면 갤러리 접근 권한이 필요합니다.",
        });
        return;
      }

      setIsSaved(false);
      await MediaLibrary.saveToLibraryAsync(dreamVideoUrl);
      showDialog({
        title: "저장 완료",
        message: "영상이 갤러리에 저장되었습니다.",
      });
    } catch (error) {
      console.error("영상 저장 오류:", error);
      showDialog({ title: "오류", message: "영상 저장에 실패했습니다." });
    }
  };

  const handleSaveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showDialog({
          title: "권한 필요",
          message: "이미지를 저장하려면 갤러리 접근 권한이 필요합니다.",
        });
        return;
      }

      setIsSaved(false);

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      showDialog({
        title: "저장 완료",
        message: "이미지가 갤러리에 저장되었습니다.",
      });
    } catch (error) {
      showDialog({ title: "오류", message: "이미지 저장에 실패했습니다." });
      console.error(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} ref={viewRef} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <View />
          <Pressable onPress={handleSave}>
            <Text style={styles.saveText}>저장하기</Text>
          </Pressable>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{dreamTitle || "제목 없는 꿈"}</Text>

          <View style={styles.videoSection}>
            <View style={styles.videoBox}>
              {dreamVideoUrl ? (
                <Video
                  source={{ uri: dreamVideoUrl }}
                  style={styles.videoPreview}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                />
              ) : (
                <Text style={styles.videoPlaceholderText}>
                  {localDreamId
                    ? "꿈 영상을 준비하고 있어요."
                    : "아직 생성된 꿈 영상이 없습니다."}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.sectionLabel}>꿈 요약</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.summaryText}>{dreamSummary}</Text>
          </View>

          <Text style={styles.sectionLabel}>꿈 해몽</Text>
          <View style={styles.optionsWrapper}>
            <View style={styles.interpretationOption}>
              {selectedMood ? (
                <Image
                  source={selectedMood.image}
                  style={styles.moodIconOnly}
                />
              ) : null}
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {dreamTitle || "제목 없는 꿈"}
                </Text>
                <Text style={styles.optionDescription}>
                  {dreamInterpretation || "아직 해몽이 없습니다."}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={[styles.buttonContainer, { paddingBottom: BOTTOM_INSET }]}>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
          </Pressable>
        </View>

        <AppModal
          visible={isSaved}
          title="무엇을 저장할까요?"
          message="해몽 이미지를 저장하거나 꿈 영상을 저장할 수 있습니다."
          buttons={[
            { text: "해몽 이미지 저장", onPress: handleSaveImage },
            { text: "꿈 영상 저장", onPress: handleSaveVideo },
            { text: "닫기", style: "cancel" },
          ]}
          onClose={() => setIsSaved(false)}
        />

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
                  : "1점에서 5점 사이로 선택해주세요"}
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
                    {isSubmittingFeedback ? "저장 중..." : "제출하고 이동"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#282828",
    letterSpacing: -0.36,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: FIXED_BUTTON_HEIGHT + 40,
  },
  videoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#000000",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  characterText: {
    fontSize: 14,
    color: colors.background,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 32,
    alignSelf: "stretch",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inactive,
    marginBottom: 10,
    marginLeft: 4,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  optionsWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  interpretationOption: {
    backgroundColor: colors.purpleLight,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
  },
  moodIconOnly: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.purple,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.inactive,
    lineHeight: 18,
    flexWrap: "wrap",
  },
  videoSection: {
    marginBottom: 28,
  },
  videoPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
    gap: 10,
  },
  nextButton: {
    height: FIXED_BUTTON_HEIGHT,
    backgroundColor: colors.buttonColor,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  ratingOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  ratingCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    lineHeight: 28,
  },
  ratingSubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: colors.inactive,
    textAlign: "center",
    lineHeight: 20,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 38,
    color: "#D1D5DB",
  },
  starTextActive: {
    color: "#FACC15",
  },
  ratingCaption: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.purple,
    textAlign: "center",
  },
  reasonSection: {
    marginTop: 20,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: "600",
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
    backgroundColor: "#F9FAFB",
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
    alignItems: "center",
    justifyContent: "center",
  },
  ratingSkipButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  ratingSubmitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.buttonColor,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingSubmitButtonDisabled: {
    backgroundColor: "#D8B4FE",
  },
  ratingSubmitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  moodLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
});
