export type MoodId = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export const SERVER_MOOD_BY_ID: Record<MoodId, string> = {
  "1": "happy",
  "2": "sad",
  "3": "anger",
  "4": "excitement",
  "5": "impressed",
  "6": "proclamation",
  "7": "ambiguous",
};

export const normalizeMoodId = (moodValue: unknown): MoodId => {
  const value = String(moodValue ?? "").trim().toLowerCase();

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
    case "angry":
      return "3";
    case "4":
    case "신남":
    case "흥분":
    case "excitement":
    case "excited":
      return "4";
    case "5":
    case "감동":
    case "impressed":
    case "touched":
      return "5";
    case "6":
    case "공포":
    case "proclamation":
    case "scared":
    case "fear":
      return "6";
    case "7":
    case "미묘":
    case "혼란":
    case "알 수 없음":
    case "ambiguous":
    case "mixed":
      return "7";
    default:
      return "7";
  }
};

export const moodIdToServerMood = (moodValue: unknown) =>
  SERVER_MOOD_BY_ID[normalizeMoodId(moodValue)];
