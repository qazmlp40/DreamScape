// 더미 데이터 - 월간 감정 태그 개수

import { EmotionKey } from "./emotionTypes";

export const MOCK_MONTHLY_DATA: Record<string, Record<EmotionKey, number>> = {
  // key 예: '2025-11'
  '2025-02': {
    happy: 0,
    sad: 4,
    anger: 1,
    fear: 9,
    mixed: 6,
    touched: 0,
    excited: 0,
  },
  '2025-03': {
    happy: 1,
    sad: 7,
    anger: 1,
    fear: 1,
    mixed: 3,
    touched: 0,
    excited: 6,
  },
  '2025-05': {
    happy: 3,
    sad: 1,
    anger: 0,
    fear: 2,
    mixed: 1,
    touched: 4,
    excited: 1,
  },
  '2025-07': {
    happy: 7,
    sad: 1,
    anger: 1,
    fear: 1,
    mixed: 3,
    touched: 1,
    excited: 4,
  },
  '2025-09': {
    happy: 2,
    sad: 3,
    anger: 7,
    fear: 0,
    mixed: 3,
    touched: 1,
    excited: 1,
  },
  '2025-10': {
    happy: 2,
    sad: 1,
    anger: 0,
    fear: 0,
    mixed: 5,
    touched: 3,
    excited: 0,
  },
  '2025-12': {
    happy: 3,
    sad: 4,
    anger: 1,
    fear: 1,
    mixed: 3,
    touched: 2,
    excited: 6,
  }
};