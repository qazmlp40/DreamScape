export interface DreamEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  emotion: 'happy' | 'sad' | 'angry' | 'excited' | 'impressed' | 'surprised';
  content?: string;
  summary?: string;      // 꿈 내용 요약
  keywords?: string[];   // 키워드 배열
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamMarking {
  hasDream?: boolean;
  emotionEmoji?: string;
  emotionImage?: any;
  selected?: boolean;
  selectedColor?: string;
}