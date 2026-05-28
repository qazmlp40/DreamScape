import DreamSymbolIcon from "@/components/app/DreamSymbolIcon";
import RecordHeader from "@/components/app/RecordHeader";
import SaveConfirmModal from "@/components/app/SaveConfirmModal";
import { KakaoShareIcon } from "@/components/ui/KakaoShareIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KakaoTemplateLink } from "@react-native-kakao/share";
import { shareFeedTemplate } from "@react-native-kakao/share";
import Constants from "expo-constants";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { API_BASE_URL, APP_SCHEME, DEV_MOCK_DREAMS } from "../../constants/api";
import {
  KAKAO_APP_KEY,
  KAKAO_SHARE_IMAGE_URL,
  buildKakaoSharePageUrl,
} from "../../constants/kakao";
import { useAppDialog } from "../../contexts/AppDialogContext";
import {
  type DreamRecord,
  useDreamRecord,
} from "../../contexts/DreamRecordContext";
import { dreamApi, getMockDreamById } from "../../services/dreamApi";
import {
  extractDreamDate,
  extractDreamId,
  extractDreamInterpretation,
  extractDreamMediaId,
  extractDreamSummary,
  extractDreamTags,
  extractDreamText,
  extractDreamTitle,
  extractDreamVideoUrl,
  firstText,
  getParamNumber,
  getParamValue,
} from "../../utils/dreamNormalize";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F3F4F6",
  border: "#E5E7EB",
  buttonColor: "#BB7CFF",
  inactive: "#9CA3AF",
};

const FIXED_BUTTON_HEIGHT = 56;
const isExpoGo = Constants.appOwnership === "expo";

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

const isPublicHttpsUrl = (url?: string) => {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    return !(
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const buildAppShareUrl = (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  return `${APP_SCHEME}://record/result-view${query ? `?${query}` : ""}`;
};

type RemoteDreamRecord = {
  dreamId?: number;
  date?: string;
  title?: string;
  mood?: string;
  dreamText?: string;
  summary?: string;
  interpretation?: string;
  videoUrl?: string;
  mediaId?: number;
  tags?: string[];
};

type DreamResultViewModel = {
  remoteId?: string;
  localId?: string;
  dreamId?: number;
  date?: string;
  selectedDate?: string;
  mood?: string;
  title: string;
  dreamText: string;
  summary: string;
  interpretation: string;
  videoUrl?: string;
  mediaId?: number;
  tags: string[];
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
  const mood =
    firstText(
      remoteRecord?.mood,
      localRecord?.mood,
      getParamValue(params.mood),
      canUseCurrentRecord ? currentRecord.mood : undefined,
    ) ?? undefined;

  const title =
    firstText(
      remoteRecord?.title,
      localRecord?.title,
      getParamValue(params.title),
      canUseCurrentRecord ? currentRecord.title : undefined,
    ) ?? "";
  const summary =
    firstText(
      remoteRecord?.summary,
      localRecord?.analysis?.summary,
      getParamValue(params.summary),
      canUseCurrentRecord ? currentRecord.analysis?.summary : undefined,
      remoteRecord?.dreamText,
      localRecord?.dreamText,
      getParamValue(params.dreamText),
      canUseCurrentRecord ? currentRecord.dreamText : undefined,
    ) ?? "";
  const dreamText =
    firstText(
      remoteRecord?.dreamText,
      localRecord?.dreamText,
      getParamValue(params.dreamText),
      canUseCurrentRecord ? currentRecord.dreamText : undefined,
    ) ?? "";
  const interpretation =
    firstText(
      remoteRecord?.interpretation,
      localRecord?.analysis?.interpretation,
      getParamValue(params.interpretation),
      canUseCurrentRecord ? currentRecord.analysis?.interpretation : undefined,
    ) ?? "";
  const videoUrl =
    firstText(
      remoteRecord?.videoUrl,
      localRecord?.videoUrl,
      getParamValue(params.videoUrl),
      canUseCurrentRecord ? currentRecord.videoUrl : undefined,
    ) ?? undefined;
  const mediaId = remoteRecord?.mediaId ?? getParamNumber(params.mediaId);
  const tags =
    remoteRecord?.tags ??
    localRecord?.analysis?.tags ??
    getParamValue(params.tags)
      ?.split(",")
      .map((tag: string) => tag.trim())
      .filter(Boolean) ??
    (canUseCurrentRecord ? currentRecord.analysis?.tags : undefined) ??
    [];

  return {
    remoteId,
    localId,
    dreamId,
    date,
    selectedDate,
    mood,
    title,
    dreamText,
    summary,
    interpretation,
    videoUrl,
    mediaId,
    tags,
  };
};

export default function ResultViewScreen() {
  const {
    currentRecord,
    savedRecords,
    getRecordByLocalId,
    getRecordByDate,
    updateRecordByLocalId,
    updateRecordByDreamId,
  } = useDreamRecord();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { showDialog } = useAppDialog();
  const [isSaved, setIsSaved] = useState(false);
  const viewRef = useRef(null);
  const [remoteRecord, setRemoteRecord] = useState<RemoteDreamRecord | null>(
    null,
  );
  const analysisBackfillRef = useRef<Set<number>>(new Set());
  const videoBackfillRef = useRef<Set<number>>(new Set());
  const fetchDreamId =
    getParamValue(params.id) ?? getParamValue(params.dreamId);
  const fetchDreamIdNumber = getParamNumber(fetchDreamId);

  // 기존 꿈 상세 조회
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
                tags: mockDream.tags ?? [],
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

        // 직접 axios를 호출하지 않고 dreamApi.getDreamById() 사용
        const data = await dreamApi.getDreamById(Number(fetchDreamId));

        console.log("[ResultView] dream detail raw response:", {
          fetchDreamId,
          data,
        });
        const fetchedDreamId = extractDreamId(data) ?? getParamNumber(fetchDreamId);
        const expectedDreamId = getParamNumber(fetchDreamId);

        if (
          expectedDreamId !== undefined &&
          fetchedDreamId !== undefined &&
          fetchedDreamId !== expectedDreamId
        ) {
          console.warn(
            "꿈 상세 응답의 dreamId가 요청한 dreamId와 달라서 무시합니다.",
            {
              expectedDreamId,
              fetchedDreamId,
            },
          );
          setRemoteRecord(null);
          return;
        }

        setRemoteRecord({
          dreamId: fetchedDreamId,
          date: extractDreamDate(data),
          title: extractDreamTitle(data),
          mood: data.mood || data.emotion,
          dreamText: extractDreamText(data),
          summary: extractDreamSummary(data),
          interpretation: extractDreamInterpretation(data),
          videoUrl: extractDreamVideoUrl(data),
          mediaId: extractDreamMediaId(data),
          tags: extractDreamTags(data),
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
  const localRecordByDate =
    !fetchDreamIdNumber && getParamValue(params.date)
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

  // 요약/ 해몽 누락 시 재생성 및 저장
  useEffect(() => {
    const run = async () => {
      const dreamId = dreamResult.dreamId;

      if (!dreamId) {
        return;
      }

      // 누락 여부 판단
      if (dreamResult.remoteId && remoteRecord === null) {
        return;
      }

      const hasGeneratedSummary = Boolean(
        firstText(
          remoteRecord?.summary,
          localRecord?.analysis?.summary,
          !dreamResult.remoteId ? currentRecord.analysis?.summary : undefined,
        ),
      );
      const hasInterpretation = Boolean(
        firstText(
          remoteRecord?.interpretation,
          localRecord?.analysis?.interpretation,
          !dreamResult.remoteId
            ? currentRecord.analysis?.interpretation
            : undefined,
        ),
      );

      if (
        (hasGeneratedSummary && hasInterpretation) ||
        analysisBackfillRef.current.has(dreamId)
      ) {
        return;
      }

      analysisBackfillRef.current.add(dreamId);

      try {
        const dreamText =
          remoteRecord?.dreamText ??
          localRecord?.dreamText ??
          getParamValue(params.dreamText) ??
          currentRecord.dreamText;

        // 요약/ 해몽 재생성 요청
        const [summarizeResult, interpretResult] = await Promise.allSettled([
          hasGeneratedSummary || !dreamText
            ? Promise.resolve(null)
            : dreamApi.summarizeDream(dreamId, dreamText),
          hasInterpretation
            ? Promise.resolve(null)
            : dreamApi.interpretDream(dreamId),
        ]);
        const summarizeRes =
          summarizeResult.status === "fulfilled" ? summarizeResult.value : null;
        const interpretRes =
          interpretResult.status === "fulfilled" ? interpretResult.value : null;
        const summary =
          summarizeRes?.aiSummary ?? summarizeRes?.summary ?? undefined;
        const interpretation =
          interpretRes?.aiInterpretation ??
          interpretRes?.interpretation ??
          interpretRes?.analysisText ??
          undefined;
        const detectedTags =
          interpretRes?.detectedKeywords ??
          interpretRes?.tags ??
          localRecord?.analysis?.tags ??
          [];

        if (!summary && !interpretation) {
          return;
        }

        setRemoteRecord((prev) => ({
          ...(prev ?? {}),
          dreamId,
          ...(summary ? { summary } : {}),
          ...(interpretation ? { interpretation } : {}),
          tags: detectedTags,
        }));

        const nextAnalysis = {
          summary:
            summary ??
            localRecord?.analysis?.summary ??
            currentRecord.analysis?.summary ??
            dreamText ??
            "",
          interpretation:
            interpretation ??
            localRecord?.analysis?.interpretation ??
            currentRecord.analysis?.interpretation ??
            "",
          tags: detectedTags,
        };

        if (dreamResult.localId) {
          updateRecordByLocalId(dreamResult.localId, {
            dreamId,
            analysis: nextAnalysis,
          });
        } else {
          updateRecordByDreamId(dreamId, { analysis: nextAnalysis });
        }
      } catch (error) {
        console.error("[ResultView] generated analysis backfill failed:", error);
      }
    };

    run();
  }, [
    currentRecord.analysis,
    currentRecord.dreamText,
    dreamResult.dreamId,
    dreamResult.localId,
    dreamResult.remoteId,
    localRecord,
    params.dreamText,
    remoteRecord,
    updateRecordByDreamId,
    updateRecordByLocalId,
  ]);


  // 영상 url 누락 시 생성 및 저장
  useEffect(() => {
    const run = async () => {
      const mode = getParamValue(params.mode);
      console.log("[ResultView] video effect state:", {
        mode,
        dreamId: dreamResult.dreamId,
        hasVideoUrl: Boolean(dreamResult.videoUrl),
        videoUrl: dreamResult.videoUrl,
      });
      if (
        !dreamResult.dreamId ||
        dreamResult.videoUrl ||
        videoBackfillRef.current.has(dreamResult.dreamId)
      ) {
        return;
      }

      if (dreamResult.remoteId && remoteRecord === null) {
        return;
      }

      videoBackfillRef.current.add(dreamResult.dreamId);

      try {
        console.log("[ResultView] generateVideo 요청:", {
          dreamId: dreamResult.dreamId,
        });
        const videoRes = await dreamApi.generateVideo(dreamResult.dreamId);
        console.log("[ResultView] generateVideo 응답:", videoRes);
        const responseDreamId = getParamNumber(
          videoRes.dreamId ?? videoRes.id ?? videoRes.dream_id,
        );
        const isMismatchedVideo =
          responseDreamId !== undefined &&
          responseDreamId !== dreamResult.dreamId;

        if (isMismatchedVideo) {
          console.warn(
            "꿈 영상 응답의 dreamId가 현재 꿈과 달라서 무시합니다.",
            {
              expectedDreamId: dreamResult.dreamId,
              responseDreamId,
            },
          );
          return;
        }
        // url 추출
        const videoUrl = videoRes.mediaUrl ?? videoRes.videoUrl ?? undefined;

        if (!videoUrl) {
          console.warn("[ResultView] generateVideo 응답에 videoUrl/mediaUrl 없음:", videoRes);
          return;
        }

        setRemoteRecord((prev) => ({
          ...(prev ?? {}),
          dreamId: dreamResult.dreamId,
          videoUrl,
          mediaId: getParamNumber(videoRes.mediaId),
        }));

        if (dreamResult.localId) {
          updateRecordByLocalId(dreamResult.localId, {
            dreamId: dreamResult.dreamId,
            videoUrl,
          });
        } else {
          updateRecordByDreamId(dreamResult.dreamId, { videoUrl });
        }
      } catch (error) {
        console.error("꿈 영상 생성 실패:", error);
      }
    };

    run();
  }, [
    dreamResult.dreamId,
    dreamResult.localId,
    dreamResult.remoteId,
    dreamResult.videoUrl,
    params.mode,
    remoteRecord,
    updateRecordByDreamId,
    updateRecordByLocalId,
  ]);

  const handleShareKakao = async () => {
    if (!KAKAO_APP_KEY) {
      showDialog({
        title: "오류",
        message: "카카오 앱 키가 설정되지 않았어요.",
      });
      return;
    }

    const videoShareUrl = buildAbsoluteUrl(dreamResult.videoUrl);
    const publicVideoShareUrl = isPublicHttpsUrl(videoShareUrl)
      ? videoShareUrl
      : undefined;
    const shareTitle = dreamResult.title || "제목없는 꿈";
    const shareDescription =
      dreamResult.summary ||
      dreamResult.interpretation ||
      "DreamScape에서 기록한 꿈이에요.";
    const appShareParams = Object.fromEntries(
      Object.entries({
        route: "record/result-view",
        id: dreamResult.remoteId ?? dreamResult.dreamId?.toString(),
        dreamId: dreamResult.dreamId?.toString(),
        localId: dreamResult.localId,
        mode: "view",
      }).filter(([, value]) => Boolean(value)),
    ) as Record<string, string>;
    const appShareUrl = buildAppShareUrl(appShareParams);
    const sharePageUrl = buildKakaoSharePageUrl({
      title: shareTitle,
      summary: shareDescription,
      open: appShareUrl,
      ...(dreamResult.tags.length ? { tags: dreamResult.tags.join(",") } : {}),
      ...(publicVideoShareUrl ? { videoUrl: publicVideoShareUrl } : {}),
    });
    const publicWebShareUrl = isPublicHttpsUrl(sharePageUrl)
      ? sharePageUrl
      : undefined;
    const shareUrl = publicWebShareUrl ?? publicVideoShareUrl;
    const kakaoLink: KakaoTemplateLink = {
      androidExecutionParams: appShareParams,
      iosExecutionParams: appShareParams,
      ...(shareUrl ? { mobileWebUrl: shareUrl, webUrl: shareUrl } : {}),
    };

    const shareWithSystemSheet = async () => {
      await Share.share({
        title: shareTitle,
        message: `${shareTitle}\n\n${shareDescription}${
          shareUrl ? `\n\n${shareUrl}` : ""
        }`,
        url: shareUrl ?? appShareUrl,
      });
    };

    if (isExpoGo) {
      await shareWithSystemSheet();
      return;
    }

    try {
      await shareFeedTemplate({
        template: {
          content: {
            title: shareTitle,
            description: shareDescription,
            imageUrl: KAKAO_SHARE_IMAGE_URL,
            link: kakaoLink,
          },
          buttons: [
            {
              title: publicVideoShareUrl ? "영상 보기" : "앱에서 보기",
              link: kakaoLink,
            },
          ],
        },
        useWebBrowserIfKakaoTalkNotAvailable: true,
      });
    } catch (error) {
      console.error("카카오톡 공유 실패:", error);
      try {
        await shareWithSystemSheet();
      } catch (fallbackError) {
        console.error("시스템 공유 실패:", fallbackError);
        showDialog({
          title: "오류",
          message: "공유를 완료하지 못했어요. 카카오 설정을 확인한 뒤 다시 시도해 주세요.",
        });
      }
    }
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  // result-view에서 video-view로 review mode를 넘겨 영상 재생성을 방지한다.
  const handleNext = () => {
    const mode = getParamValue(params.mode);

    router.push({
      pathname: "/record/video-view",
      params: {
        ...(mode ? { mode } : {}),
        ...(dreamResult.remoteId ? { id: dreamResult.remoteId } : {}),
        ...(dreamResult.date ? { date: dreamResult.date } : {}),
        ...(dreamResult.selectedDate
          ? { selectedDate: dreamResult.selectedDate }
          : {}),
        ...(dreamResult.localId ? { localId: dreamResult.localId } : {}),
        ...(dreamResult.mood ? { mood: dreamResult.mood } : {}),
        title: dreamResult.title,
        ...(dreamResult.summary ? { summary: dreamResult.summary } : {}),
        ...(dreamResult.interpretation
          ? { interpretation: dreamResult.interpretation }
          : {}),
        ...(dreamResult.dreamText ? { dreamText: dreamResult.dreamText } : {}),
        ...(dreamResult.tags.length ? { tags: dreamResult.tags.join(",") } : {}),
        ...(dreamResult.dreamId
          ? { dreamId: String(dreamResult.dreamId) }
          : {}),
        ...(dreamResult.videoUrl ? { videoUrl: dreamResult.videoUrl } : {}),
        ...(dreamResult.mediaId ? { mediaId: String(dreamResult.mediaId) } : {}),
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
      showDialog({ title: "오류", message: "이미지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." });
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
          <Text style={styles.title}>
            {dreamResult.title || "제목없는 꿈"}
          </Text>

          <View style={styles.videoSection}>
            <View
              style={styles.videoBox}
            >
              <DreamSymbolIcon
                tags={dreamResult.tags}
                text={`${dreamResult.title} ${dreamResult.summary} ${dreamResult.interpretation} ${dreamResult.dreamText}`}
                width={132}
                height={132}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>꿈 요약</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.summaryText}>{dreamResult.summary}</Text>
          </View>

          <Text style={styles.sectionLabel}>꿈 해몽</Text>
          <View style={styles.optionsWrapper}>
            <Text style={styles.interpretationText}>
              {dreamResult.interpretation || "아직 해몽이 없어요."}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareKakao}
            activeOpacity={0.8}
          >
            <KakaoShareIcon width={24} height={24} />
            <Text style={styles.shareButtonText}>공유하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>

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
    paddingBottom: FIXED_BUTTON_HEIGHT + 100,
  },
  videoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
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
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    gap: 16,
  },
  shareButton: {
    backgroundColor: "#FEE500",
    borderRadius: 12,
    padding: 16,
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
  nextButton: {
    backgroundColor: colors.buttonColor,
    borderRadius: 12,
    padding: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
