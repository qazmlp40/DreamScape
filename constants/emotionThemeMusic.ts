export type EmotionThemeMusicSource = number | { uri: string };

const happyMusic: EmotionThemeMusicSource = require("../assets/audio/happy.mp3");
const sadMusic: EmotionThemeMusicSource = require("../assets/audio/sad.mp3");
const angerMusic: EmotionThemeMusicSource = require("../assets/audio/anger.mp3");
const excitementMusic: EmotionThemeMusicSource = require("../assets/audio/excitement.mp3");
const impressedMusic: EmotionThemeMusicSource = require("../assets/audio/impressed.mp3");
const scaredMusic: EmotionThemeMusicSource = require("../assets/audio/scared.mp3");
const ambiguousMusic: EmotionThemeMusicSource = require("../assets/audio/ambiguous.mp3");

const emotionThemeMusicByMood: Record<string, EmotionThemeMusicSource | null> =
  {
    "1": happyMusic,
    행복: happyMusic,
    행복함: happyMusic,
    happy: happyMusic,

    "2": sadMusic,
    슬픔: sadMusic,
    sad: sadMusic,

    "3": angerMusic,
    분노: angerMusic,
    anger: angerMusic,
    angry: angerMusic,

    "4": excitementMusic,
    신남: excitementMusic,
    흥분: excitementMusic,
    excitement: excitementMusic,
    excited: excitementMusic,

    "5": impressedMusic,
    감동: impressedMusic,
    impressed: impressedMusic,
    touched: impressedMusic,

    "6": scaredMusic,
    공포: scaredMusic,
    proclamation: scaredMusic,
    scared: scaredMusic,
    fear: scaredMusic,

    "7": ambiguousMusic,
    미묘: ambiguousMusic,
    "알 수 없음": ambiguousMusic,
    ambiguous: ambiguousMusic,
    mixed: ambiguousMusic,
  };

export const getEmotionThemeMusicSource = (mood?: string | null) => {
  if (!mood?.trim()) {
    return null;
  }

  return emotionThemeMusicByMood[mood.trim()] ?? null;
};
