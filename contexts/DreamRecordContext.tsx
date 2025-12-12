import React, { createContext, ReactNode, useContext, useState } from 'react';

// 타입 정의
export interface DreamRecord {
  id: string;
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
  setVideoUrl: (url: string) => void;
  
  saveRecord: (selectedDate?: string) => void;
  resetCurrent: () => void;
  
  getRecordByDate: (date: string) => DreamRecord | undefined;
  getRecordById: (id: string) => DreamRecord | undefined;
  updateRecord: (id: string, updates: Partial<DreamRecord>) => void;
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

  const saveRecord = (selectedDate?: string) => {
    if (!currentMood || !currentDreamText) {
      console.warn('기분과 꿈 내용이 필요합니다.');
      return;
    }

    const newRecord: DreamRecord = {
      id: Date.now().toString(),
      date: selectedDate || getTodayDate(),
      title: currentTitle || '꿈 제목',
      mood: currentMood,
      dreamText: currentDreamText,
      analysis: currentAnalysis || undefined,
      videoUrl: currentVideoUrl || undefined,
    };

    setSavedRecords((prev) => {
      const updated = [...prev, newRecord];
      console.log('✅ 저장 완료:', newRecord);
      console.log('💾 전체 레코드:', updated);
      return updated;
    });
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

  const getRecordById = (id: string) => {
    return savedRecords.find((record) => record.id === id);
  };

  const updateRecord = (id: string, updates: Partial<DreamRecord>) => {
    setSavedRecords((prev) => {
      const updated = prev.map((record) => 
        record.id === id ? { ...record, ...updates } : record
      );
      console.log('✅ 레코드 업데이트 완료:', { id, updates });
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
    getRecordById,
    updateRecord,
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