import FixedBottomButton from "@/components/app/FixedBottomButton";
import RecordHeader from "@/components/app/RecordHeader";
import SaveConfirmModal from "@/components/app/SaveConfirmModal";
import PigIcon from "@/assets/images/icons/dream_symbol/pig.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { API_BASE_URL, DEV_MOCK_DREAMS } from "../../constants/api";
import { useAppDialog } from "../../contexts/AppDialogContext";
import { type DreamRecord, useDreamRecord } from "../../contexts/DreamRecordContext";
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

type RemoteDreamRecord = {
  dreamId?: number;
  date?: string;
  title?: string;
  mood?: string;
  dreamText?: string;
  summary?: string;
  interpretation?: string;
  videoUrl?: string;
};

type DreamResultViewModel = {
  remoteId?: string;
  localId?: string;
  dreamId?: number;
  date?: string;
  selectedDate?: string;
  title: string;
  summary: string;
  interpretation: string;
  videoUrl?: string;
};

const getParamValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" && value.trim() ? value : undefined;
};

const getParamNumber = (value: unknown) => {
  const rawValue = getParamValue(value);
  if (!rawValue) {
    return undefined;
  }

  const numberValue = Number(rawValue);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const firstText = (...values: (string | null | undefined)[]) => {
  return values.find((value) => value?.trim())?.trim();
};

const buildDreamResultViewModel = ({
  params,
  localRecord,
  currentRecord,
  remoteRecord,
}: {
  params: ReturnType<typeof useLocalSearchParams>;
  localRecord?: DreamRecord;
  currentRecord: {
    title: string;
    mood: string | null;
    dreamText: string;
    analysis: DreamRecord["analysis"] | null;
    videoUrl: string | null;
  };
  remoteRecord: RemoteDreamRecord | null;
}): DreamResultViewModel => {
  const remoteId = getParamValue(params.id) ?? getParamValue(params.dreamId);
  const localId = localRecord?.localId ?? getParamValue(params.localId);
  const canUseCurrentRecord = !remoteId && !localRecord;
  const dreamId =
    remoteRecord?.dreamId ??
    localRecord?.dreamId ??
    getParamNumber(params.dreamId) ??
    getParamNumber(params.id);
  const date =
    remoteRecord?.date ??
    localRecord?.date ??
    getParamValue(params.date) ??
    getParamValue(params.selectedDate);
  const selectedDate = getParamValue(params.selectedDate);

  const title =
    firstText(
      remoteRecord?.title,
      localRecord?.title,
      canUseCurrentRecord ? currentRecord.title : undefined,
    ) ??
    "";
  const summary =
    firstText(
      remoteRecord?.summary,
      localRecord?.analysis?.summary,
      canUseCurrentRecord ? currentRecord.analysis?.summary : undefined,
      remoteRecord?.dreamText,
      localRecord?.dreamText,
      canUseCurrentRecord ? currentRecord.dreamText : undefined,
    ) ?? "";
  const interpretation =
    firstText(
      remoteRecord?.interpretation,
      localRecord?.analysis?.interpretation,
      canUseCurrentRecord ? currentRecord.analysis?.interpretation : undefined,
    ) ?? "";
  const videoUrl =
    firstText(
      remoteRecord?.videoUrl,
      localRecord?.videoUrl,
      canUseCurrentRecord ? currentRecord.videoUrl : undefined,
    ) ??
    undefined;

  return {
    remoteId,
    localId,
    dreamId,
    date,
    selectedDate,
    title,
    summary,
    interpretation,
    videoUrl,
  };
};

export default function RecordStep5Screen() {
  const {
    currentRecord,
    savedRecords,
    getRecordByLocalId,
    getRecordByDate,
    updateRecordByLocalId,
  } = useDreamRecord();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { showDialog } = useAppDialog();
  const [isSaved, setIsSaved] = useState(false);
  const viewRef = useRef(null);
  const [remoteRecord, setRemoteRecord] = useState<RemoteDreamRecord | null>(
    null,
  );
  const fetchDreamId = getParamValue(params.id) ?? getParamValue(params.dreamId);
  const fetchDreamIdNumber = getParamNumber(fetchDreamId);

  useEffect(() => {
    const fetchDream = async () => {
      if (!fetchDreamId) {
        setRemoteRecord(null);
        return;
      }

      if (DEV_MOCK_DREAMS) {
        const mockDreamId = getParamNumber(fetchDreamId);
        const mockDream = mockDreamId ? getMockDreamById(mockDreamId) : null;
        setRemoteRecord(
          mockDream
            ? {
              title: mockDream.title,
              mood: mockDream.mood,
              summary: mockDream.aiSummary ?? mockDream.rawText,
              interpretation: mockDream.aiInterpretation,
              videoUrl: mockDream.mediaUrl ?? undefined,
              dreamId: mockDream.dreamId,
              date: mockDream.createdAt.slice(0, 10),
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

        const res = await axios.get(`${API_BASE_URL}/api/dreams/${fetchDreamId}`);
        const data = res.data || {};
        const fetchedDreamId = Number(
          data.dreamId ?? data.id ?? getParamNumber(fetchDreamId),
        );
        const expectedDreamId = getParamNumber(fetchDreamId);

        if (
          expectedDreamId !== undefined &&
          Number.isFinite(fetchedDreamId) &&
          fetchedDreamId !== expectedDreamId
        ) {
          console.warn("꿈 상세 응답의 dreamId가 요청한 dreamId와 달라서 무시합니다.", {
            expectedDreamId,
            fetchedDreamId,
          });
          setRemoteRecord(null);
          return;
        }

        setRemoteRecord({
          dreamId: Number.isFinite(fetchedDreamId) ? fetchedDreamId : undefined,
          date: data.date ?? data.dreamDate ?? data.createdAt?.slice?.(0, 10),
          title: data.title || data.dreamTitle,
          mood: data.mood || data.emotion,
          dreamText: data.rawText ?? data.content,
          summary:
            data.aiSummary ?? data.summary ?? data.rawText ?? data.content,
          interpretation:
            data.aiInterpretation ?? data.interpretation ?? data.analysisText,
          videoUrl:
            data.mediaUrl ??
            data.videoUrl ??
            data.video?.mediaUrl ??
            data.media?.mediaUrl,
        });
      } catch (error) {
        console.error("꿈 데이터 불러오기 실패:", error);
      }
    };

    fetchDream();
  }, [fetchDreamId]);

  const localRecordByLocalId = getParamValue(params.localId)
    ? getRecordByLocalId(String(getParamValue(params.localId)))
    : undefined;
  const localRecordByDreamId = fetchDreamIdNumber
    ? savedRecords.find((record) => record.dreamId === fetchDreamIdNumber)
    : undefined;
  const localRecordByDate = !fetchDreamIdNumber && getParamValue(params.date)
    ? getRecordByDate(String(getParamValue(params.date)))
    : undefined;
  const localRecord =
    localRecordByLocalId ?? localRecordByDreamId ?? localRecordByDate;

  const dreamResult = buildDreamResultViewModel({
    params,
    localRecord,
    currentRecord,
    remoteRecord,
  });

  useEffect(() => {
    const run = async () => {
      if (!dreamResult.dreamId || dreamResult.videoUrl) {
        return;
      }

      try {
        const videoRes = await dreamApi.generateVideo(dreamResult.dreamId);
        const responseDreamId = getParamNumber(
          videoRes.dreamId ?? videoRes.id ?? videoRes.dream_id,
        );
        const isMismatchedVideo =
          responseDreamId !== undefined && responseDreamId !== dreamResult.dreamId;

        if (isMismatchedVideo) {
          console.warn("꿈 영상 응답의 dreamId가 현재 꿈과 달라서 무시합니다.", {
            expectedDreamId: dreamResult.dreamId,
            responseDreamId,
          });
          return;
        }

        const videoUrl = videoRes.mediaUrl ?? videoRes.videoUrl ?? undefined;

        if (!videoUrl) {
          return;
        }

        setRemoteRecord((prev) => ({
          ...(prev ?? {}),
          dreamId: dreamResult.dreamId,
          videoUrl,
        }));

        if (dreamResult.localId) {
          updateRecordByLocalId(dreamResult.localId, {
            dreamId: dreamResult.dreamId,
            videoUrl,
          });
        }
      } catch (error) {
        console.error("꿈 영상 생성 실패:", error);
      }
    };

    run();
  }, [
    dreamResult.dreamId,
    dreamResult.localId,
    dreamResult.videoUrl,
    updateRecordByLocalId,
  ]);

  const handleSave = () => {
    setIsSaved(true);
  };

  const handleNext = () => {
    router.push({
      pathname: "/record/step4",
      params: {
        ...(dreamResult.remoteId ? { id: dreamResult.remoteId } : {}),
        ...(dreamResult.date ? { date: dreamResult.date } : {}),
        ...(dreamResult.selectedDate
          ? { selectedDate: dreamResult.selectedDate }
          : {}),
        ...(dreamResult.localId ? { localId: dreamResult.localId } : {}),
        ...(dreamResult.dreamId ? { dreamId: String(dreamResult.dreamId) } : {}),
        ...(dreamResult.videoUrl ? { videoUrl: dreamResult.videoUrl } : {}),
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
      <SafeAreaView edges={[]} style={styles.container} ref={viewRef} collapsable={false}>
        <RecordHeader
          showBack={false}
          rightText="저장하기"
          onRightPress={handleSave}
        />

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{dreamResult.title || "제목 없는 꿈"}</Text>

          <View style={styles.videoSection}>
            <View style={styles.videoBox}>
              <PigIcon width={120} height={120} />
            </View>
          </View>

          <Text style={styles.sectionLabel}>꿈 요약</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.summaryText}>{dreamResult.summary}</Text>
          </View>

          <Text style={styles.sectionLabel}>꿈 해몽</Text>
          <View style={styles.optionsWrapper}>
            <Text style={styles.interpretationText}>
              {dreamResult.interpretation || "아직 해몽이 없습니다."}
            </Text>
          </View>
        </ScrollView>

        <FixedBottomButton label="다음" onPress={handleNext} />

        <SaveConfirmModal
          visible={isSaved}
          kind="image"
          onSave={handleSaveImage}
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
    paddingTop: 8,
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
});
