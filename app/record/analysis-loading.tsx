import { API_BASE_URL } from "@/constants/api";
import { dreamApi } from "@/services/dreamApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDreamRecord } from "../../contexts/DreamRecordContext";
import { extractDreamTitle } from "../../utils/dreamNormalize";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F3F4F6",
  border: "#E5E7EB",
  inactive: "#9CA3AF",
  accent: "#BB7CFF",
  accentSoft: "#F3E8FF",
  accentStrong: "#BB7CFF",
  accentText: "#A56EFF",
};

const MIN_LOADING_DURATION_MS = 5000;
const ANALYSIS_RETRY_DELAY_MS = 3000;

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

export default function AnalysisLoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const hasRunRef = useRef(false);
  const dotLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const dotAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0)),
  ).current;
  const mergeAnim = useRef(new Animated.Value(0)).current;
  const dotGroupOpacity = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.72)).current;
  const [loadingText, setLoadingText] = useState(
    "장면과 감정을 정리해서 해석을 준비하는 중이에요",
  );

  const {
    currentDreamText: contextDreamText = "",
    setTitle,
    setAnalysis,
    updateRecordByLocalId,
  } = useDreamRecord();

  const dreamTextParam = getParamValue(params.dreamText) ?? "";

  const finalDreamText = dreamTextParam || contextDreamText || "";

  const runAnimation = (animation: Animated.CompositeAnimation) => {
    return new Promise<void>((resolve) => {
      animation.start(() => resolve());
    });
  };

  useEffect(() => {
    const dotLoop = Animated.loop(
      Animated.stagger(
        180,
        dotAnims.map((dotAnim) =>
          Animated.sequence([
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 420,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim, {
              toValue: 0,
              duration: 420,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );

    dotLoopRef.current = dotLoop;
    dotLoop.start();

    return () => {
      dotLoop.stop();
      dotLoopRef.current = null;
    };
  }, [dotAnims]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      const startedAt = Date.now();
      const dreamId = getParamNumber(params.dreamId);
      const localId = getParamValue(params.localId);
      let generatedTitle = "";
      let generatedSummary = "";
      let generatedInterpretation = "";
      let generatedTags: string[] = [];
      let shouldNavigate = false;

      console.log("[AnalysisLoading] API_BASE_URL:", API_BASE_URL);
      console.log("[AnalysisLoading] dreamId:", dreamId);
      console.log("[AnalysisLoading] finalDreamText:", finalDreamText);

      try {
        let summary = finalDreamText ?? "";
        let interpretation = "";
        let tags: string[] = [];

        if (dreamId) {
          while (true) {
            console.log("[AnalysisLoading] summarizeDream 호출 dreamId:", dreamId);
            console.log("[AnalysisLoading] interpretDream 호출 dreamId:", dreamId);
            setLoadingText("서버에서 꿈 분석 결과를 가져오는 중이에요");

            const [summarizeResult, interpretResult] = await Promise.allSettled([
              dreamApi.summarizeDream(dreamId, finalDreamText),
              dreamApi.interpretDream(dreamId),
            ]);

            if (summarizeResult.status === "fulfilled") {
              const summarizeRes = summarizeResult.value;
              console.log("[AnalysisLoading] dreamApi.summarizeDream 응답:", summarizeRes);

              summary =
                summarizeRes.aiSummary ??
                summarizeRes.summary ??
                "";
              generatedTitle = extractDreamTitle(summarizeRes);
            } else {
              console.log(
                "summarize failed:",
                summarizeResult.reason?.response?.status,
                summarizeResult.reason?.response?.data,
              );
            }

            if (interpretResult.status === "fulfilled") {
              const interpretRes = interpretResult.value;
              console.log("[AnalysisLoading] dreamApi.interpretDream 응답:", interpretRes);

              interpretation =
                interpretRes.aiInterpretation ??
                interpretRes.interpretation ??
                interpretRes.analysisText ??
                "";
              tags = interpretRes.detectedKeywords ?? interpretRes.tags ?? [];
            } else {
              console.log(
                "interpret failed:",
                interpretResult.reason?.response?.status,
                interpretResult.reason?.response?.data,
              );
            }

            if (summary && interpretation) {
              break;
            }

            setLoadingText("분석 서버 응답을 기다리고 있어요");
            await new Promise((resolve) =>
              setTimeout(resolve, ANALYSIS_RETRY_DELAY_MS),
            );
          }
        } else {
          console.warn("[AnalysisLoading] dreamId가 없어 서버 분석을 건너뜁니다.");
          setLoadingText("꿈 정보를 찾지 못했어요");
          return;
        }

        setAnalysis({
          summary,
          interpretation,
          tags,
        });
        if (generatedTitle) {
          setTitle(generatedTitle);
        }
        console.log("[AnalysisLoading] analysis resolved before updateDream:", {
          dreamId,
          title: generatedTitle,
          finalDreamTextLength: finalDreamText.length,
          summary,
          interpretation,
          tags,
        });
        generatedSummary = summary;
        generatedInterpretation = interpretation;
        generatedTags = tags;

        if (localId) {
          updateRecordByLocalId(localId, {
            ...(dreamId ? { dreamId } : {}),
            ...(generatedTitle ? { title: generatedTitle } : {}),
            analysis: {
              summary,
              interpretation,
              tags,
            },
          });
          console.log("[AnalysisLoading] local record에 dreamId/analysis 연결 완료:", {
            localId,
            dreamId,
          });
        } else {
          console.log("[AnalysisLoading] localId 없이 서버 dreamId 기준으로 계속 진행합니다.");
        }
        shouldNavigate = true;
      } catch (error) {
        console.error("[AnalysisLoading] API 호출 중 예상치 못한 에러:", error);
        setLoadingText("분석 서버 응답을 기다리고 있어요");
        return;
      } finally {
        if (!shouldNavigate) {
          return;
        }

        const elapsed = Date.now() - startedAt;
        const remaining = MIN_LOADING_DURATION_MS - elapsed;

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        dotLoopRef.current?.stop();

        await runAnimation(
          Animated.parallel(
            dotAnims.map((dotAnim) =>
              Animated.timing(dotAnim, {
                toValue: 0,
                duration: 140,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ),
          ),
        );

        await runAnimation(
          Animated.parallel([
            Animated.timing(mergeAnim, {
              toValue: 1,
              duration: 260,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dotGroupOpacity, {
              toValue: 0,
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(140),
              Animated.parallel([
                Animated.timing(checkOpacity, {
                  toValue: 1,
                  duration: 120,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(checkScale, {
                  toValue: 1,
                  duration: 240,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(checkScale, {
                  toValue: 1.16,
                  duration: 120,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(checkScale, {
                  toValue: 1,
                  duration: 160,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ]),
        );

        const selectedDate = getParamValue(params.selectedDate);
        const mood = getParamValue(params.mood);

        router.replace({
          pathname: "/record/symbol-complete",
          params: {
            ...(dreamId ? { dreamId: String(dreamId) } : {}),
            ...(localId ? { localId } : {}),
            ...(mood ? { mood } : {}),
            ...(generatedTitle ? { title: generatedTitle } : {}),
            ...(generatedSummary ? { summary: generatedSummary } : {}),
            ...(generatedInterpretation
              ? { interpretation: generatedInterpretation }
              : {}),
            ...(generatedTags.length ? { tags: generatedTags.join(",") } : {}),
            ...(finalDreamText ? { dreamText: finalDreamText } : {}),
            ...(selectedDate ? { selectedDate } : {}),
          },
        } as any);
      }
    };

    run();
  }, [
    finalDreamText,
    params.dreamId,
    params.localId,
    params.mood,
    params.selectedDate,
    router,
    setAnalysis,
    setTitle,
    updateRecordByLocalId,
    checkOpacity,
    checkScale,
    dotAnims,
    dotGroupOpacity,
    mergeAnim,
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centerWrapper}>
        <View style={styles.animationStage}>
          {dotAnims.map((dotAnim, index) => (
            <Animated.View
              key={`loading-dot-${index}`}
              style={[
                styles.dot,
                {
                  left: index * 24,
                  opacity: Animated.multiply(
                    dotGroupOpacity,
                    dotAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 1],
                    }),
                  ),
                  transform: [
                    {
                      translateX: mergeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange:
                          index === 0 ? [0, 24] : index === 2 ? [0, -24] : [0, 0],
                      }),
                    },
                    {
                      translateY: dotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                    {
                      scale: dotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.18],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.checkIconWrap,
              {
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={46}
              color={colors.accent}
            />
          </Animated.View>
        </View>
        <Text style={styles.loadingTitle}>꿈 기록을 분석하는 중이에요</Text>
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  animationStage: {
    width: 62,
    height: 26,
    position: "relative",
    marginBottom: 22,
  },
  dot: {
    position: "absolute",
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accentStrong,
  },
  checkIconWrap: {
    position: "absolute",
    top: -12,
    left: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.accentText,
    letterSpacing: 0,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: colors.inactive,
    marginTop: 10,
    textAlign: "center",
  },
});
