import { API_BASE_URL } from "@/constants/api";
import { dreamApi } from "@/services/dreamApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useDreamRecord } from "../../contexts/DreamRecordContext";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F3F4F6",
  border: "#E5E7EB",
  inactive: "#9CA3AF",
};

export default function RecordStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const hasRunRef = useRef(false);

  const {
    currentDreamText: contextDreamText = "",
    setAnalysis,
    updateRecordByLocalId,
  } = useDreamRecord();

  const dreamTextParam =
    typeof params.dreamText === "string"
      ? decodeURIComponent(params.dreamText)
      : "";

  const finalDreamText = contextDreamText || dreamTextParam || "";

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      const dreamIdParam = params.dreamId;
      const dreamId =
        typeof dreamIdParam === "string" ? Number(dreamIdParam) : NaN;
      const localIdParam = params.localId;
      const localId = typeof localIdParam === "string" ? localIdParam : "";

      console.log("[Step2] API_BASE_URL:", API_BASE_URL);
      console.log("[Step2] dreamIdParam:", dreamIdParam, "->", dreamId);
      console.log("[Step2] finalDreamText:", finalDreamText);

      // dreamId가 없어도 그냥 진행 (기본값 사용)
      const finalDreamId = dreamId || 1; // 기본값으로 1 사용

      try {
        setIsLoading(true);

        const [summarizeResult, interpretResult] = await Promise.allSettled([
          dreamApi.summarizeDream(finalDreamId, finalDreamText),
          dreamApi.interpretDream(finalDreamId),
        ]);

        let summary = finalDreamText ?? "";
        let interpretation = "";
        let tags: string[] = [];

        if (summarizeResult.status === "fulfilled") {
          const summarizeRes = summarizeResult.value;
          console.log("[Step2] dreamApi.summarizeDream 응답:", summarizeRes);

          summary =
            summarizeRes.aiSummary ??
            summarizeRes.summary ??
            finalDreamText ??
            "";
        } else {
          console.log(
            "summarize failed:",
            summarizeResult.reason?.response?.status,
            summarizeResult.reason?.response?.data,
          );
          // 실패해도 기본값 사용
          summary = finalDreamText || "꿈 내용";
        }

        if (interpretResult.status === "fulfilled") {
          const interpretRes = interpretResult.value;
          console.log("[Step2] dreamApi.interpretDream 응답:", interpretRes);

          interpretation = interpretRes.aiInterpretation ?? "";
          tags = interpretRes.tags ?? [];
        } else {
          console.log(
            "interpret failed:",
            interpretResult.reason?.response?.status,
            interpretResult.reason?.response?.data,
          );
          // 실패해도 기본값 사용
          interpretation = "꿈 해석을 준비 중입니다.";
          tags = [];
        }

        setAnalysis({
          summary,
          interpretation,
          tags,
        });

        if (localId) {
          updateRecordByLocalId(localId, {
            dreamId: finalDreamId,
            analysis: {
              summary,
              interpretation,
              tags,
            },
          });
          console.log("[Step2] local record에 dreamId/analysis 연결 완료:", {
            localId,
            dreamId: finalDreamId,
          });
        } else {
          console.warn("[Step2] localId가 없어서 record 연결 불가");
        }
      } catch (error) {
        console.error("[Step2] API 호출 중 예상치 못한 에러:", error);
        // 에러가 발생해도 기본값으로 진행
        setAnalysis({
          summary: finalDreamText || "꿈 내용",
          interpretation: "꿈 해석을 준비 중입니다.",
          tags: [],
        });
      } finally {
        setIsLoading(false);
        const selectedDate = params.selectedDate as string | undefined;

        router.replace(
          `/record/step3?dreamId=${finalDreamId}&localId=${localId}${
            selectedDate ? `&selectedDate=${selectedDate}` : ""
          }` as any,
        );
      }
    };

    run();
  }, [params.dreamId, params.localId]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#BB7CFF" />
        <Text style={styles.loadingText}>분석 중...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
  },
});
