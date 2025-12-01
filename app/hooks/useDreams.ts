import { useState, useEffect } from 'react';
import { DreamEntry } from '../types/dream';
import { DreamService } from '../services/dreamService';

export const useDreams = () => {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDreams = async () => {
    try {
      setLoading(true);
      const dreamData = await DreamService.getAllDreams();
      setDreams(dreamData);
    } catch (error) {
      console.error('꿈 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDreams();
  }, []);

  const getDreamByDate = (date: string): DreamEntry | undefined => {
    return dreams.find(dream => dream.date === date);
  };

  const createDream = async (dreamData: Omit<DreamEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDream = await DreamService.createDream(dreamData);
      setDreams(prev => [...prev, newDream]);
      return newDream;
    } catch (error) {
      console.error('꿈 데이터 생성 실패:', error);
      throw error;
    }
  };

  return {
    dreams,
    loading,
    getDreamByDate,
    createDream,
    refreshDreams: loadDreams,
  };
};