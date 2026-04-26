import AppModal from "@/components/app/AppModal";
import PigIcon from "@/assets/images/icons/dream_symbol/pig.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { API_BASE_URL, DEV_MOCK_DREAMS } from "../../constants/api";
import { useAppDialog } from "../../contexts/AppDialogContext";
import { useDreamRecord } from "../../contexts/DreamRecordContext";
import { dreamApi, getMockDreamById } from "../../services/dreamApi";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F3F4F6",
  border: "#E5E7EB",
  buttonColor: "#BB7CFF",
  inactive: "#9CA3AF",
};

const FIXED_BUTTON_HEIGHT = 56;

export default function RecordStep5Screen() {
  const {
    currentRecord,
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

  // params로 저장된 record 먼저 찾기
  const record =
    (params.localId ? getRecordByLocalId(String(params.localId)) : null) ??
    (params.date ? getRecordByDate(String(params.date)) : null);

  // record를 먼저 쓰고, 없으면 currentRecord (DreamRecord 타입으로 좁히기)
  const displayRecord:
    | import("../../contexts/DreamRecordContext").DreamRecord
    | null =
    record ??
    (currentRecord.mood
      ? (currentRecord as unknown as import("../../contexts/DreamRecordContext").DreamRecord)
      : null);

  // 화면에 뿌리는 데이터도 displayRecord 기준으로 통일
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
    setIsSaved(true);
  };

  const handleNext = () => {
    router.push({
      pathname: "/record/step4",
      params: {
        ...(params.id ? { id: String(params.id) } : {}),
        ...(params.date ? { date: String(params.date) } : {}),
        ...(params.selectedDate ? { selectedDate: String(params.selectedDate) } : {}),
        ...(displayRecord?.localId ? { localId: displayRecord.localId } : {}),
        ...(localDreamId ? { dreamId: String(localDreamId) } : {}),
        ...(dreamVideoUrl ? { videoUrl: dreamVideoUrl } : {}),
      },
    } as any);
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
              <PigIcon width={120} height={120} />
            </View>
          </View>

          <Text style={styles.sectionLabel}>꿈 요약</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.summaryText}>{dreamSummary}</Text>
          </View>

          <Text style={styles.sectionLabel}>꿈 해몽</Text>
          <View style={styles.optionsWrapper}>
            <Text style={styles.interpretationText}>
              {dreamInterpretation || "아직 해몽이 없습니다."}
            </Text>
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
          title="이미지를 저장하시겠습니까?"
          message="현재 꿈 이미지를 갤러리에 저장할 수 있습니다."
          buttons={[
            { text: "닫기", style: "cancel", onPress: () => setIsSaved(false) },
            { text: "이미지 저장", onPress: handleSaveImage },
          ]}
          onClose={() => setIsSaved(false)}
        />
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 32,
  },
  interpretationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  videoSection: {
    marginBottom: 28,
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
});
