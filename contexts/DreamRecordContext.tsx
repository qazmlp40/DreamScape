import React, { createContext, ReactNode, useContext, useState } from 'react';

// 타입 정의
export interface DreamRecord {
  localId: string; // 프론트 기록용 - savedRecords 안에서 현재 꿈 record 찾을 때 사용
  dreamId?: number; // 백엔드 API용 - summarize / interpret / generateVideo 같은 백엔드 API 요청에 사용
  date: string;
  title: string;
  mood: string;
  dreamText: string;
  analysis?: {
    summary: string;
    interpretation: string;
    tags: string[];
  };
  videoUrl?: string;
}

// 저장할 때 직접 넘길 payload 타입 
export interface SaveRecordPayload {
  selectedDate?: string;
  title: string;
  mood: string;
  dreamText: string;
  analysis?: DreamRecord['analysis'] | null;
  videoUrl?: string | null;
  dreamId?: number;
}

interface DreamRecordContextType {
  // ✅ currentRecord 추가
  currentRecord: {
    title: string;
    mood: string | null;
    dreamText: string;
    analysis: DreamRecord['analysis'] | null;
    videoUrl: string | null;
  };
  
  currentTitle: string;
  currentMood: string | null;
  currentDreamText: string;
  currentAnalysis: DreamRecord['analysis'] | null;
  currentVideoUrl: string | null;
  savedRecords: DreamRecord[];
  
  setTitle: (title: string) => void;
  setMood: (mood: string) => void;
  setDreamText: (text: string) => void;
  setAnalysis: (analysis: DreamRecord['analysis']) => void;
  setVideoUrl: (url: string | null) => void;
  
  // 여기 수정
  saveRecord: (payload: SaveRecordPayload) => string | null;
  resetCurrent: () => void;

  getRecordByDate: (date: string) => DreamRecord | undefined;
  getRecordByLocalId: (localId: string) => DreamRecord | undefined;
  updateRecordByLocalId: (localId: string, updates: Partial<DreamRecord>) => void;
  updateRecordByDreamId: (dreamId: number, updates: Partial<DreamRecord>) => void;
  getTodayRecord: () => DreamRecord | undefined;
  hasTodayRecord: () => boolean;
}

const DreamRecordContext = createContext<DreamRecordContextType | undefined>(undefined);

export const DreamRecordProvider = ({ children }: { children: ReactNode }) => {
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentDreamText, setCurrentDreamText] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<DreamRecord['analysis'] | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<DreamRecord[]>([]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const saveRecord = (payload: SaveRecordPayload): string | null => {
    const {
      selectedDate,
      title,
      mood,
      dreamText,
      analysis = null,
      videoUrl = null,
      dreamId,
    } = payload;

    if (!mood || !dreamText.trim()) {
      console.warn('기분과 꿈 내용이 필요합니다.');
      return null;
    }

    const newLocalId = Date.now().toString();

    const newRecord: DreamRecord = {
      localId: newLocalId,
      dreamId: dreamId ?? undefined,
      date: selectedDate || getTodayDate(),
      title,
      mood,
      dreamText: dreamText.trim(),
      analysis: analysis ?? undefined,
      videoUrl: videoUrl ?? undefined,
    };

    setSavedRecords((prev) => {
      const updated = [...prev, newRecord];
      console.log('✅ 저장 완료:', newRecord);
      console.log('💾 전체 레코드:', updated);
      return updated;
    });

    return newLocalId;
  };

  const resetCurrent = () => {
    setCurrentTitle('');
    setCurrentMood(null);
    setCurrentDreamText('');
    setCurrentAnalysis(null);
    setCurrentVideoUrl(null);
  };

  const getRecordByDate = (date: string) => {
    return savedRecords.find((record) => record.date === date);
  };

  const getRecordByLocalId = (localId: string) => {
    return savedRecords.find((record) => record.localId === localId);
  };

  const updateRecordByLocalId = (localId: string, updates: Partial<DreamRecord>) => {
    setSavedRecords((prev) => {
      const updated = prev.map((record) => 
        record.localId === localId ? { ...record, ...updates } : record
      );
      console.log('✅ 레코드 업데이트 완료:', { localId, updates });
      return updated;
    });
  };

  const updateRecordByDreamId = (dreamId: number, updates: Partial<DreamRecord>) => {
    setSavedRecords((prev) => {
      const updated = prev.map((record) =>
        record.dreamId === dreamId ? { ...record, ...updates } : record
      );
      console.log('✅ dreamId 기준 레코드 업데이트 완료:', { dreamId, updates });
      return updated;
    });
  };

  const getTodayRecord = () => {
    const today = getTodayDate();
    return savedRecords.find((record) => record.date === today);
  };

  const hasTodayRecord = () => {
    return getTodayRecord() !== undefined;
  };

  const value: DreamRecordContextType = {
    // ✅ currentRecord 추가
    currentRecord: {
      title: currentTitle,
      mood: currentMood,
      dreamText: currentDreamText,
      analysis: currentAnalysis,
      videoUrl: currentVideoUrl,
    },
    
    currentTitle,
    currentMood,
    currentDreamText,
    currentAnalysis,
    currentVideoUrl,
    savedRecords,
    setTitle: setCurrentTitle,
    setMood: setCurrentMood,
    setDreamText: setCurrentDreamText,
    setAnalysis: setCurrentAnalysis,
    setVideoUrl: setCurrentVideoUrl,
    saveRecord,
    resetCurrent,
    getRecordByDate,
    getRecordByLocalId,
    updateRecordByLocalId,
    updateRecordByDreamId,
    getTodayRecord,
    hasTodayRecord,
  };

  return (
    <DreamRecordContext.Provider value={value}>
      {children}
    </DreamRecordContext.Provider>
  );
};

export const useDreamRecord = () => {
  const context = useContext(DreamRecordContext);
  if (!context) {
    throw new Error('useDreamRecord는 DreamRecordProvider 내부에서 사용해야 합니다.');
  }
  return context;
};