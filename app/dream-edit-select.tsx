import NoteIcon from "@/assets/images/icons/note_mini.svg";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDreamRecord } from "../contexts/DreamRecordContext";
import IMAGES from "./assets/images";

const colors = {
  text: "#1F2937",
  background: "#FFFFFF",
  border: "#E5E7EB",
  purple: "#BB7CFF",
  purpleLight: "#F3E8FF",
  inactive: "#9CA3AF",
};

const moodIcons: { [key: string]: any } = {
  "1": IMAGES.happy_icon,
  "2": IMAGES.sad_icon,
  "3": IMAGES.anger_icon,
  "4": IMAGES.excitement_icon,
  "5": IMAGES.impressed_icon,
  "6": IMAGES.scared_icon,
  "7": IMAGES.ambiguous_icon,
};

export default function DreamEditSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedDate = typeof params.date === "string" ? params.date : "";
  const { getRecordsByDate } = useDreamRecord();

  const dreams = selectedDate ? getRecordsByDate(selectedDate).slice().reverse() : [];

  const formatSelectedDate = () => {
    if (!selectedDate) return "꿈 선택";
    const date = new Date(selectedDate);
    return `${date.getMonth() + 1}월 ${date.getDate()}일의 꿈`;
  };

  const handleDreamPress = (localId: string, dreamId?: number) => {
    router.push({
      pathname: "/dream-edit",
      params: {
        date: selectedDate,
        localId,
        ...(dreamId ? { dreamId: String(dreamId) } : {}),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"<"}</Text>
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
                key={dream.localId}
                style={styles.card}
                onPress={() => handleDreamPress(dream.localId, dream.dreamId)}
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
                    {dream.title?.trim() || "제목 없는 꿈"}
                  </Text>
                </View>
                <Text style={styles.cardText} numberOfLines={2}>
                  {dream.analysis?.interpretation || dream.dreamText || "꿈 내용을 확인해보세요."}
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
  backText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
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
