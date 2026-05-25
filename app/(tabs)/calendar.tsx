import NoteIcon from "@/assets/images/icons/note_mini.svg";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Svg, { Path } from "react-native-svg";
import { useAppDialog } from "../../contexts/AppDialogContext";
import { dreamApi } from "../../services/dreamApi";
import {
  extractDreamDate,
  extractDreamId,
  extractDreamInterpretation,
  extractDreamSummary,
  extractDreamText,
  extractDreamTitle,
  extractDreamVideoUrl,
  getDreamListFromResponse,
} from "../../utils/dreamNormalize";
import {
  ambiguous_icon,
  anger_icon,
  excitement_icon,
  happy_icon,
  impressed_icon,
  sad_icon,
  scared_icon,
} from "../assets/images";

// 🇰🇷 한글 로케일 설정
LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

// 📐 반응형 유틸리티
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BASE_WIDTH = 412;
const BASE_HEIGHT = 917;

const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

// 🔥 공통 색상 정의 (홈과 동일)
const colors = {
  primary: "#5B76EE",
  text: "#1F2937",
  background: "#FFFFFF",
  cardBackground: "#F9FAFB",
  border: "#E5E7EB",
  inactive: "#9CA3AF",
  recordButtonColor: "#BB7CFF",
};

// 🔥 반응형 상수
const CALENDAR_HORIZONTAL_PADDING = scale(16);
const CALENDAR_WIDTH = SCREEN_WIDTH - CALENDAR_HORIZONTAL_PADDING * 2;
const CARD_WIDTH = SCREEN_WIDTH - scale(32);

// 날짜 셀 크기
const DAY_CELL_WIDTH = (CALENDAR_WIDTH - scale(20)) / 7;
const EMOJI_CIRCLE_SIZE = 32;
const DAY_NUMBER_SIZE = Math.min(scale(20), DAY_CELL_WIDTH * 0.5);

// 🔥 하단 패딩 (탭바 고려)
const REQUIRED_BOTTOM_PADDING = 72 + 60 + 16 + 20;

type DateData = {
  year: number;
  month: number;
  day: number;
  timestamp?: number;
  dateString: string;
};

type DreamMarking = {
  hasDream?: boolean;
  emotionImage?: any;
  selected?: boolean;
  selectedColor?: string;
};

type CalendarDream = {
  id: string;
  dreamId?: number;
  date: string;
  title: string;
  mood: string;
  dreamText: string;
  summary: string;
  interpretation: string;
  videoUrl: string;
};

interface CustomDayProps {
  date?: DateData;
  state?: string;
  marking?: DreamMarking;
  onPress?: (date: DateData) => void;
}

const formatDateToString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isFutureDateString = (dateString: string) => {
  const todayString = formatDateToString(new Date());
  return dateString > todayString;
};

// 오늘 날짜를 기본값으로 설정
const today = new Date();
const INITIAL_SELECTED_DATE = formatDateToString(today);

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
    case "excitement":
    case "excited":
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

const normalizeDream = (dream: any): CalendarDream | null => {
  const dreamId = extractDreamId(dream);
  const date = extractDreamDate(dream);
  const dreamText = extractDreamText(dream);
  const summary = extractDreamSummary(dream);

  if (!date) {
    return null;
  }

  return {
    id: String(dreamId || `${date}-${Math.random()}`),
    dreamId,
    date,
    title: extractDreamTitle(dream),
    mood: normalizeMood(dream?.mood ?? dream?.emotion),
    dreamText,
    summary: summary || dreamText,
    interpretation: extractDreamInterpretation(dream),
    videoUrl: extractDreamVideoUrl(dream),
  };
};

// ✏️ 편집 아이콘 컴포넌트
const EditIcon = ({ size = 24, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.79007 15.2701L8.52007 11.8601C8.62635 11.3862 8.86574 10.9525 9.21007 10.6101L15.8801 4.00005C16.5565 3.31103 17.4748 2.91283 18.4401 2.89005C19.1681 2.87962 19.8701 3.16042 20.3901 3.67005C21.5263 5.01252 21.3796 7.01727 20.0601 8.18005L13.3901 14.8501C13.0476 15.1944 12.6139 15.4338 12.1401 15.5401L8.73007 16.2701H8.54007C8.29078 16.2796 8.05268 16.1662 7.903 15.9666C7.75332 15.767 7.71111 15.5067 7.79007 15.2701ZM10.2701 11.6801C10.13 11.8158 10.0326 11.9896 9.99007 12.1801L9.50007 14.5101L11.8301 14.0101C12.0205 13.9675 12.1943 13.8702 12.3301 13.7301L19.0001 7.06005C19.7308 6.47507 19.8758 5.42053 19.3301 4.66005C19.0911 4.43176 18.7704 4.30922 18.4401 4.32005C17.8706 4.34292 17.3326 4.58685 16.9401 5.00005L10.2701 11.6801Z"
      fill={color}
    />
    <Path
      d="M19.9101 10.9301C19.4981 10.9354 19.1655 11.2681 19.1601 11.6801V17.3701C19.1735 18.1743 18.8633 18.9503 18.2993 19.5238C17.7352 20.0972 16.9645 20.4202 16.1601 20.4201H6.63008C4.96745 20.3875 3.63519 19.033 3.63008 17.3701V7.88005C3.65738 6.21514 5.01494 4.87983 6.68008 4.88005H12.3701C12.7843 4.88005 13.1201 4.54426 13.1201 4.13005C13.1201 3.71584 12.7843 3.38005 12.3701 3.38005H6.63008C4.13658 3.3799 2.10748 5.3867 2.08008 7.88005V17.3701C2.08008 19.8829 4.11718 21.9201 6.63008 21.9201H16.1201C18.6291 21.9145 20.6601 19.879 20.6601 17.3701V11.6801C20.6547 11.2681 20.322 10.9354 19.9101 10.9301Z"
      fill={color}
    />
  </Svg>
);

// === 커스텀 Day 컴포넌트 ===
const CustomDay: React.FC<CustomDayProps> = ({
  date,
  state,
  marking,
  onPress,
}) => {
  if (!date) return null;

  const isDisabled = state === "disabled";
  const isSelected = marking?.selected;
  const emotionImage = marking?.emotionImage;
  const isFuture = isFutureDateString(date.dateString);

  let textColor = "#5C5C5C";
  if (isSelected) {
    textColor = "#FFFFFF";
  } else if (isFuture) {
    textColor = "#D9D9D9";
  } else if (isDisabled) {
    textColor = "#D9D9D9";
  }

  const handlePress = () => {
    if (date && onPress && !isDisabled) {
      onPress(date);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.dayContainer}
      activeOpacity={0.6}
      disabled={isDisabled}
    >
      <View
        style={[styles.dayNumberCircle, isSelected && styles.dayNumberSelected]}
      >
        <Text style={[styles.dayText, { color: textColor }]}>{date.day}</Text>
      </View>

      <View style={styles.emojiWrapper}>
        <View
          style={[styles.emojiCircle, !emotionImage && styles.emojiCircleEmpty]}
        />

        {emotionImage && (
          <Image source={emotionImage} style={styles.emojiImage} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// === 메인 화면 컴포넌트 ===
export default function CalendarScreen() {
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const [dreams, setDreams] = useState<CalendarDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    INITIAL_SELECTED_DATE,
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const selectedDreams = dreams.filter((dream) => dream.date === selectedDate);
  const selectedDream = selectedDreams[selectedDreams.length - 1];
  const hasDreamRecord = selectedDreams.length > 0;
  const isEmpty = !isLoading && !isError && !hasDreamRecord;

  const loadDreams = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await dreamApi.getDreams();
      const dreamList = getDreamListFromResponse(response);
      const nextDreams = dreamList.map(normalizeDream).filter(Boolean);

      console.log('[Calendar] 서버 mood 원본값:', dreamList.map((d: any) => d?.mood ?? d?.emotion));
      setDreams(nextDreams as CalendarDream[]);
    } catch (error) {
      console.error("캘린더 꿈 목록 조회 실패:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [loadDreams]),
  );

  const handleEditPress = () => {
    if (!hasDreamRecord) {
      return;
    }

    router.push({
      pathname: "/dream-edit-select",
      params: {
        date: selectedDate,
      },
    } as any);
  };

  // 꿈 기록하기 버튼 → record/step1.tsx로 이동
  const handleRecordPress = () => {
    if (isFutureDateString(selectedDate)) {
      showDialog({
        title: "미래 날짜 선택 불가",
        message: "오늘 이후 날짜에는 꿈을 기록할 수 없습니다.",
      });
      return;
    }
    router.push(`/record/step1?selectedDate=${selectedDate}`);
  };

  const handleCardPress = (localId?: string) => {
    const targetDream = localId
      ? selectedDreams.find((dream) => dream.id === localId)
      : selectedDream;

    if (!targetDream?.dreamId) {
      return;
    }

    router.push({
      pathname: "/dream-view",
      params: {
        mode: "review",
        date: selectedDate,
        id: String(targetDream.dreamId),
        dreamId: String(targetDream.dreamId),
        mood: targetDream.mood,
        title: targetDream.title,
        dreamText: targetDream.dreamText,
        summary: targetDream.summary,
        interpretation: targetDream.interpretation,
        videoUrl: targetDream.videoUrl,
      },
    } as any);
  };

  const processedMarkedDates = useMemo(() => {
    const dates: { [key: string]: DreamMarking } = {};

    dreams.forEach((record) => {
      dates[record.date] = {
        hasDream: true,
        emotionImage: moodIcons[record.mood],
      };
    });

    const todayMarking = dates[selectedDate] || {};
    dates[selectedDate] = {
      ...todayMarking,
      selected: true,
      selectedColor: "#BB7CFF",
    };

    return dates;
  }, [dreams, selectedDate]);

  const handleDayPress = (day: DateData) => {
    if (isFutureDateString(day.dateString)) {
      showDialog({
        title: "미래 날짜 선택 불가",
        message: "오늘 이후 날짜는 선택할 수 없습니다.",
      });
      return;
    }
    setSelectedDate(day.dateString);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const formatHeaderDate = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return `${year}.${month}`;
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 🔥 SafeAreaView로 감싸기 (홈과 동일) */}
      <SafeAreaView style={styles.safeContentArea}>
        {/* 🔥 상단 헤더 - 홈 스타일 적용 */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>꿈 캘린더</Text>

          {hasDreamRecord && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <EditIcon size={scale(24)} color="#000000" />
            </TouchableOpacity>
          )}

          {!hasDreamRecord && <View style={styles.editButton} />}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 캘린더 카드 */}
          <View style={styles.calendarCard}>
            {/* 커스텀 헤더 */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={goToPreviousMonth}
                style={styles.arrowBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>

              <Text style={styles.monthText}>{formatHeaderDate()}</Text>

              <TouchableOpacity
                onPress={goToNextMonth}
                style={styles.arrowBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.arrowText}>{">"}</Text>
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={styles.weekRow}>
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <View key={day} style={styles.weekCell}>
                  <Text
                    style={[
                      styles.weekText,
                      index === 0 && styles.sundayText,
                      index === 6 && styles.saturdayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* 요일 밑 구분선 */}
            <View style={styles.weekDivider} />

            {/* 캘린더 본체 */}
            <Calendar
              key={currentMonth.toISOString()}
              dayComponent={(props: any) => (
                <CustomDay {...props} onPress={handleDayPress} />
              )}
              markedDates={processedMarkedDates}
              current={currentMonth.toISOString().split("T")[0]}
              onDayPress={handleDayPress}
              hideExtraDays={false}
              hideDayNames={true}
              hideArrows={true}
              renderHeader={() => null}
              disableMonthChange={true}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
              }}
              style={styles.calendarBody}
            />
          </View>

          {/* 선택된 날짜 */}
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>{formatSelectedDate()}</Text>
          </View>

          {isLoading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color={colors.recordButtonColor} />
              <Text style={styles.emptyText}>꿈 기록을 불러오는 중이에요</Text>
            </View>
          ) : isError ? (
            <View style={styles.emptyBox}>
              <NoteIcon />
              <Text style={styles.emptyText}>꿈 기록을 불러오지 못했어요</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={loadDreams}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : hasDreamRecord ? (
            // 기록이 있을 때
            <>
              <View style={styles.interpretationSection}>
                {selectedDreams
                  .slice()
                  .reverse()
                  .map((dream) => (
                    <TouchableOpacity
                      key={dream.id}
                      activeOpacity={0.8}
                      onPress={() => handleCardPress(dream.id)}
                      style={styles.interpretationCard}
                    >
                      <View style={styles.interpretationHeader}>
                        <View style={styles.cardEmoji}>
                          {moodIcons[dream.mood] ? (
                            <Image
                              source={moodIcons[dream.mood]}
                              style={styles.cardEmojiImg}
                            />
                          ) : (
                            <View style={styles.cardEmojiEmpty} />
                          )}
                        </View>
                        <Text
                          style={styles.interpretationTitle}
                          numberOfLines={1}
                        >
                          {dream.title?.trim() || "제목 없는 꿈"}
                        </Text>
                      </View>
                      <Text style={styles.interpretationText} numberOfLines={2}>
                        {dream.dreamText ||
                          dream.summary ||
                          dream.interpretation ||
                          "아직 해몽이 없습니다."}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </>
          ) : isEmpty ? (
            // 기록이 없을 때
            <>
              <View style={styles.emptyBox}>
                <NoteIcon />
                <Text style={styles.emptyText}>
                  아직 꿈을 기록하지 않았어요!
                </Text>
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      {isEmpty && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={styles.recordBtn}
            activeOpacity={0.8}
            onPress={handleRecordPress}
          >
            <Text style={styles.recordBtnText} numberOfLines={1}>
              꿈 기록하기
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 🔥 최상단 컨테이너 (홈과 동일)
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // 🔥 SafeAreaView (홈과 동일)
  safeContentArea: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: REQUIRED_BOTTOM_PADDING,
  },

  // 🔥 상단 헤더 - 홈 스타일 적용
  topHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 0, // SafeAreaView가 처리
    paddingBottom: 16,
  },

  // 🔥 헤더 타이틀 - 홈과 동일한 스타일
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginLeft: -4,
  },

  editButton: {
    width: scale(36),
    height: scale(36),
    justifyContent: "center",
    alignItems: "center",
  },

  // 캘린더 카드
  calendarCard: {
    width: CALENDAR_WIDTH,
    backgroundColor: "#FFF",
    marginTop: scale(16),
    borderRadius: scale(16),
    paddingBottom: scale(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
  },

  arrowBtn: {
    width: scale(32),
    height: scale(32),
    justifyContent: "center",
    alignItems: "center",
  },

  arrowText: {
    fontSize: scale(18),
    fontWeight: "600",
    color: "#5C5C5C",
  },

  monthText: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "#5C5C5C",
    fontFamily: "Roboto",
  },

  weekRow: {
    flexDirection: "row",
    paddingHorizontal: scale(10),
  },

  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: scale(6),
  },

  weekText: {
    fontSize: scale(11),
    fontWeight: "500",
    color: "#ACACAC",
    fontFamily: "Roboto",
  },

  sundayText: {
    color: "#FF6B6B",
  },

  saturdayText: {
    color: "#6B9DFF",
  },

  weekDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EFEFEF",
    marginTop: scale(4),
    marginBottom: scale(2),
  },

  calendarBody: {
    width: "100%",
  },

  // Day 컴포넌트
  dayContainer: {
    width: DAY_CELL_WIDTH,
    alignItems: "center",
    paddingVertical: 0,
  },

  dayNumberCircle: {
    width: DAY_NUMBER_SIZE,
    height: DAY_NUMBER_SIZE,
    borderRadius: DAY_NUMBER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },

  dayNumberSelected: {
    backgroundColor: "#BB7CFF",
  },

  dayText: {
    fontSize: scale(10),
    fontWeight: "500",
    fontFamily: "Roboto",
  },

  emojiWrapper: {
    width: EMOJI_CIRCLE_SIZE,
    height: EMOJI_CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  emojiCircle: {
    position: "absolute",
    width: EMOJI_CIRCLE_SIZE,
    height: EMOJI_CIRCLE_SIZE,
    borderRadius: EMOJI_CIRCLE_SIZE / 2,
  },

  emojiCircleEmpty: {
    backgroundColor: "#F5F5F5",
  },

  emojiImage: {
    width: EMOJI_CIRCLE_SIZE,
    height: EMOJI_CIRCLE_SIZE,
    resizeMode: "contain",
  },

  // 날짜 섹션
  dateSection: {
    width: CARD_WIDTH,
    paddingTop: scaleHeight(20),
    paddingBottom: scaleHeight(10),
  },

  dateText: {
    fontSize: scale(15),
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "Roboto",
  },

  cardEmoji: {
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  cardEmojiImg: {
    width: scale(40),
    height: scale(40),
    resizeMode: "contain",
  },

  cardEmojiEmpty: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F5F5F5",
  },

  cardText: {
    flex: 1,
    fontSize: scale(13),
    color: "#333",
    fontFamily: "Roboto",
    lineHeight: scale(18),
  },

  interpretationSection: {
    width: CARD_WIDTH,
    gap: scale(10),
    marginTop: scale(6),
  },

  interpretationCard: {
    width: "100%",
    padding: scale(14),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  interpretationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginBottom: scale(10),
  },

  interpretationTitle: {
    flex: 1,
    fontSize: scale(14),
    color: "#1A1A1A",
    fontFamily: "Roboto",
    fontWeight: "700",
  },

  interpretationText: {
    fontSize: scale(13),
    color: "#555",
    fontFamily: "Roboto",
    lineHeight: scale(18),
  },

  // CTA 버튼
  ctaBtn: {
    width: scale(380),
    height: 60,
    paddingHorizontal: scale(142),
    paddingVertical: 19,
    backgroundColor: "#BB7CFF",
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(4),
    gap: 10,
  },

  ctaBtnText: {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Roboto",
    fontSize: 18,
    fontWeight: "700",
  },

  // 빈 상태 박스
  emptyBox: {
    width: scale(380),
    paddingVertical: scale(32),
    paddingHorizontal: scale(16),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale(16),
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  emptyImageBox: {
    width: scale(109),
    height: scale(109),
    backgroundColor: "#F5F5F5",
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    maxWidth: scale(240),
    marginTop: scale(16),
    fontSize: scale(14),
    fontWeight: "500",
    color: "#919191",
    fontFamily: "Roboto",
    textAlign: "center",
  },

  retryButton: {
    height: scale(40),
    minWidth: scale(112),
    marginTop: scale(18),
    paddingHorizontal: scale(18),
    borderRadius: scale(8),
    backgroundColor: colors.recordButtonColor,
    justifyContent: "center",
    alignItems: "center",
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(14),
    fontWeight: "700",
    fontFamily: "Roboto",
  },

  // 꿈 기록하기 버튼
  recordBtn: {
    width: scale(380),
    height: 60,
    paddingHorizontal: scale(16),
    backgroundColor: colors.recordButtonColor,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(16),
    // 그림자 (홈과 동일)
    ...Platform.select({
      ios: {
        shadowColor: "#BB7CFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  recordBtnText: {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Roboto",
    fontSize: scale(17),
    fontWeight: "700",
  },

  // CTA, 꿈 기록하기 버튼 - 고정된 위치
  fixedButtonContainer: {
    position: "absolute",
    marginHorizontal: scale(16),
    bottom: scale(22),
  },
});
