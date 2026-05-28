import NoteIcon from "@/assets/images/icons/note_mini.svg";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { dreamApi } from "../services/dreamApi";
import {
  ambiguous_icon,
  anger_icon,
  excitement_icon,
  happy_icon,
  impressed_icon,
  sad_icon,
  scared_icon,
} from "./assets/images";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  border: "#E5E7EB",
  purple: "#BB7CFF",
  purpleLight: "#F3E8FF",
  inactive: "#9CA3AF",
};

type EditableDream = {
  id: string;
  dreamId?: number;
  date: string;
  title: string;
  mood: string;
  dreamText: string;
  interpretation: string;
};

const moodIcons: { [key: string]: any } = {
  "1": happy_icon,
  "2": sad_icon,
  "3": anger_icon,
  "4": excitement_icon,
  "5": impressed_icon,
  "6": scared_icon,
  "7": ambiguous_icon,
};

const normalizeMood = (moodValue: unknown) => {
  const value = String(moodValue ?? "").trim();

  switch (value) {
    case "1":
    case "행복":
    case "행복함":
    case "happy":
      return "1";
    case "2":
    case "슬픔":
    case "sad":
      return "2";
    case "3":
    case "분노":
    case "anger":
      return "3";
    case "4":
    case "신남":
    case "흥분":
    case "excited":
    case "excitement":
      return "4";
    case "5":
    case "감동":
    case "touched":
    case "impressed":
      return "5";
    case "6":
    case "공포":
    case "fear":
    case "scared":
      return "6";
    case "7":
    case "미묘":
    case "알 수 없음":
    case "mixed":
    case "ambiguous":
      return "7";
    default:
      return "7";
  }
};

const extractDate = (dream: any) => {
  const rawDate =
    dream?.date ??
    dream?.dreamDate ??
    dream?.createdAt ??
    dream?.updatedAt ??
    "";

  return typeof rawDate === "string" ? rawDate.slice(0, 10) : "";
};

const normalizeDream = (dream: any): EditableDream | null => {
  const dreamId = Number(
    dream?.dreamId ?? dream?.id ?? dream?.dream_id ?? dream?.dreamID,
  );
  const date = extractDate(dream);

  if (!date) {
    return null;
  }

  return {
    id: String(dreamId || dream?.id || `${date}-${Math.random()}`),
    dreamId: Number.isFinite(dreamId) ? dreamId : undefined,
    date,
    title: String(dream?.title ?? dream?.dreamTitle ?? "").trim(),
    mood: normalizeMood(dream?.mood ?? dream?.emotion),
    dreamText: String(dream?.rawText ?? dream?.content ?? "").trim(),
    interpretation: String(
      dream?.aiInterpretation ?? dream?.interpretation ?? dream?.analysisText ?? "",
    ).trim(),
  };
};

export default function DreamEditSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedDate = typeof params.date === "string" ? params.date : "";
  const [dreams, setDreams] = useState<EditableDream[]>([]);

  const loadDreams = useCallback(async () => {
    if (!selectedDate) {
      setDreams([]);
      return;
    }

    try {
      const response = await dreamApi.getDreams();
      const nextDreams = Array.isArray(response)
        ? response
            .map(normalizeDream)
            .filter((dream): dream is EditableDream => Boolean(dream))
            .filter((dream) => dream.date === selectedDate)
            .reverse()
        : [];

      setDreams(nextDreams);
    } catch (error) {
      console.error("수정용 꿈 목록 조회 실패:", error);
      setDreams([]);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [loadDreams]),
  );

  const formatSelectedDate = () => {
    if (!selectedDate) return "꿈 선택";
    const date = new Date(selectedDate);
    return `${date.getMonth() + 1}월 ${date.getDate()}일의 꿈`;
  };

  const handleDreamPress = (dreamId?: number) => {
    router.push({
      pathname: "/dream-edit",
      params: {
        date: selectedDate,
        ...(dreamId ? { dreamId: String(dreamId) } : {}),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>수정할 꿈 선택</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatSelectedDate()}</Text>
        </View>

        {dreams.length > 0 ? (
          <View style={styles.cardList}>
            {dreams.map((dream) => (
              <Pressable
                key={dream.id}
                style={styles.card}
                onPress={() => handleDreamPress(dream.dreamId)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                    {moodIcons[dream.mood] ? (
                      <Image source={moodIcons[dream.mood]} style={styles.iconImage} />
                    ) : (
                      <View style={styles.iconFallback} />
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {dream.title || "제목 없는 꿈"}
                  </Text>
                </View>
                <Text style={styles.cardText} numberOfLines={2}>
                  {dream.interpretation || dream.dreamText || "꿈 내용을 확인해보세요."}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <NoteIcon />
            <Text style={styles.emptyText}>이 날짜에는 수정할 꿈이 없어요.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  cardList: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  iconFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.inactive,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.purple,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 14,
  },
  emptyText: {
    fontSize: 16,
    color: colors.inactive,
    textAlign: "center",
  },
});
