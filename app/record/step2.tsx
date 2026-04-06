import { API_BASE_URL } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import { dreamApi } from "@/services/dreamApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDreamRecord } from "../../contexts/DreamRecordContext";

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

export default function RecordStep2Screen() {
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

        const selectedDate = params.selectedDate as string | undefined;

        router.replace(
          `/record/step3?dreamId=${finalDreamId}&localId=${localId}${
            selectedDate ? `&selectedDate=${selectedDate}` : ""
          }` as any,
        );
      }
    };

    run();
  }, [
    finalDreamText,
    params.dreamId,
    params.localId,
    params.selectedDate,
    router,
    setAnalysis,
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
        <Text style={styles.loadingTitle}>로딩 중</Text>
        <Text style={styles.loadingText}>
          장면과 감정을 정리해서 해석을 준비하는 중이에요
        </Text>
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
    letterSpacing: -0.4,
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