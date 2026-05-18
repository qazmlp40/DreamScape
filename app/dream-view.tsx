import FriendIcon from "@/assets/images/icons/dream_symbol/friend.svg";
import RecordHeader from "@/components/app/RecordHeader";
import { KakaoShareIcon } from "@/components/ui/KakaoShareIcon";
import { API_BASE_URL, DEV_MOCK_DREAMS } from "@/constants/api";
import { dreamApi, getMockDreamById } from "@/services/dreamApi";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  border: "#E5E7EB",
  buttonColor: "#BB7CFF",
  inactive: "#9CA3AF",
};

const FIXED_BUTTON_HEIGHT = 56;
type DreamViewRecord = {
  dreamId?: number;
  date?: string;
  title?: string;
  mood?: string;
  dreamText?: string;
  summary?: string;
  interpretation?: string;
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

const getNestedText = (source: any, paths: string[]) => {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], source);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const buildAbsoluteUrl = (url?: string) => {
  if (!url?.trim()) {
    return undefined;
  }

  const trimmedUrl = url.trim();
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  return `${baseUrl}${path}`;
};

export default function DreamViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [remoteRecord, setRemoteRecord] = useState<DreamViewRecord | null>(
    null,
  );

  const fetchDreamId = getParamValue(params.id) ?? getParamValue(params.dreamId);

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
                dreamId: mockDream.dreamId,
                date: mockDream.createdAt.slice(0, 10),
                title: mockDream.title,
                mood: mockDream.mood,
                dreamText: mockDream.rawText,
                summary: mockDream.aiSummary ?? mockDream.rawText,
                interpretation: mockDream.aiInterpretation,
                videoUrl: mockDream.mediaUrl ?? undefined,
              }
            : null,
        );
        return;
      }

      try {
        const data = await dreamApi.getDreamById(Number(fetchDreamId));
        const fetchedDreamId = Number(
          data.dreamId ?? data.id ?? getParamNumber(fetchDreamId),
        );
        const expectedDreamId = getParamNumber(fetchDreamId);

        if (
          expectedDreamId !== undefined &&
          Number.isFinite(fetchedDreamId) &&
          fetchedDreamId !== expectedDreamId
        ) {
          setRemoteRecord(null);
          return;
        }

        setRemoteRecord({
          dreamId: Number.isFinite(fetchedDreamId) ? fetchedDreamId : undefined,
          date: data.date ?? data.dreamDate ?? data.createdAt?.slice?.(0, 10),
          title: data.title || data.dreamTitle,
          mood: data.mood || data.emotion,
          dreamText:
            getNestedText(data, ["rawText", "content", "dreamText", "text"]) ??
            undefined,
          summary:
            getNestedText(data, [
              "aiSummary",
              "summary",
              "analysis.aiSummary",
              "analysis.summary",
              "dreamAnalysis.aiSummary",
              "dreamAnalysis.summary",
              "result.aiSummary",
              "result.summary",
            ]) ?? undefined,
          interpretation:
            getNestedText(data, [
              "aiInterpretation",
              "interpretation",
              "analysisText",
              "analysis.aiInterpretation",
              "analysis.interpretation",
              "analysis.analysisText",
              "dreamAnalysis.aiInterpretation",
              "dreamAnalysis.interpretation",
              "result.aiInterpretation",
              "result.interpretation",
            ]) ?? undefined,
          videoUrl:
            getNestedText(data, [
              "mediaUrl",
              "videoUrl",
              "originalMediaUrl",
              "editedMediaUrl",
              "video.mediaUrl",
              "video.videoUrl",
              "media.mediaUrl",
              "media.videoUrl",
            ]) ?? undefined,
        });
      } catch (error) {
        console.error("꿈 상세 보기 데이터 불러오기 실패:", error);
      }
    };

    fetchDream();
  }, [fetchDreamId]);

  const dream = useMemo(() => {
    const dreamId =
      remoteRecord?.dreamId ??
      getParamNumber(params.dreamId) ??
      getParamNumber(params.id);

    return {
      dreamId,
      id: getParamValue(params.id) ?? (dreamId ? String(dreamId) : undefined),
      date:
        remoteRecord?.date ??
        getParamValue(params.date) ??
        getParamValue(params.selectedDate),
      mood: firstText(remoteRecord?.mood, getParamValue(params.mood)),
      title:
        firstText(remoteRecord?.title, getParamValue(params.title)) ??
        "제목없는 꿈",
      dreamText: firstText(
        remoteRecord?.dreamText,
        getParamValue(params.dreamText),
      ),
      summary:
        firstText(
          remoteRecord?.summary,
          getParamValue(params.summary),
          remoteRecord?.dreamText,
          getParamValue(params.dreamText),
        ) ?? "",
      interpretation:
        firstText(
          remoteRecord?.interpretation,
          getParamValue(params.interpretation),
        ) ?? "",
      videoUrl: firstText(remoteRecord?.videoUrl, getParamValue(params.videoUrl)),
    };
  }, [params, remoteRecord]);

  const handleReplayVideo = () => {
    if (!dream.videoUrl) {
      Alert.alert("안내", "저장된 영상이 없습니다.");
      return;
    }

    router.push({
      pathname: "/record/step4",
      params: {
        mode: "review",
        ...(dream.id ? { id: dream.id } : {}),
        ...(dream.dreamId ? { dreamId: String(dream.dreamId) } : {}),
        ...(dream.date ? { date: dream.date } : {}),
        ...(dream.mood ? { mood: dream.mood } : {}),
        videoUrl: dream.videoUrl,
      },
    } as any);
  };

  const handleShare = async () => {
    const videoShareUrl = buildAbsoluteUrl(dream.videoUrl);
    const description =
      dream.summary || dream.interpretation || "DreamScape에서 기록한 꿈이에요.";
    const message = [dream.title, description, videoShareUrl]
      .filter(Boolean)
      .join("\n\n");

    try {
      await Share.share({
        title: dream.title,
        message,
        ...(videoShareUrl ? { url: videoShareUrl } : {}),
      });
    } catch (error) {
      console.error("꿈 공유 실패:", error);
      Alert.alert("오류", "공유에 실패했습니다.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={[]} style={styles.container}>
        <RecordHeader showBack rightText="영상 보기" onRightPress={handleReplayVideo} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{dream.title}</Text>

          <TouchableOpacity
            style={styles.videoBox}
            onPress={handleReplayVideo}
            activeOpacity={0.85}
          >
            <FriendIcon width={116} height={116} />
            <Text style={styles.videoButtonText}>
              {dream.videoUrl ? "영상 다시보기" : "저장된 영상 없음"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>꿈 요약</Text>
          <View style={styles.contentBox}>
            <Text style={styles.summaryText}>
              {dream.summary || "아직 요약이 없습니다."}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>꿈 해몽</Text>
          <View style={styles.contentBox}>
            <Text style={styles.interpretationText}>
              {dream.interpretation || "아직 해몽이 없습니다."}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <KakaoShareIcon width={24} height={24} />
            <Text style={styles.shareButtonText}>공유하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: FIXED_BUTTON_HEIGHT + 84,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  videoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    marginBottom: 28,
  },
  videoButtonText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: colors.buttonColor,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inactive,
    marginBottom: 10,
    marginLeft: 4,
  },
  contentBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 32,
    alignSelf: "stretch",
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  interpretationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  shareButton: {
    height: 56,
    backgroundColor: "#FEE500",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C1E1E",
  },
});
