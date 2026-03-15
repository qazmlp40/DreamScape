import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const dreamApi = {
  // ✅ 꿈 생성
  saveDream: async (data: { 
    date: string;
    title: string;
    dreamText: string;
    mood: string;
    summary?: string; 
    interpretation?: string;
  }): Promise<{ dreamId: number }> => { 

    console.log('[dreamApi.saveDream] 호출:', data);

    const userId = await AsyncStorage.getItem('userId'); 

    if (!userId) {
      throw new Error('userId가 없습니다. 다시 로그인하세요.');
    }

    console.log('[dreamApi.saveDream] 요청 URL:', `/api/dreams/${userId}`);

    const response = await api.post(`/api/dreams/${userId}`, { 
      title: data.title, 
      rawText: data.dreamText,
      mood: data.mood,
    });

    console.log('[dreamApi.saveDream] 응답:', response.data);
    return response.data;
  },

  // ✅ 사용자 꿈 목록 조회
  getDreams: async () => {
    const userId = await AsyncStorage.getItem('userId'); 
  
    if (!userId) {
      throw new Error('userId가 없습니다. 다시 로그인하세요.');
    }
  
    const response = await api.get(`/api/dreams/user/${userId}`); 
  
    return response.data;
  },
 
  // ✅ 날짜별 꿈 조회
  getDreamByDate: async (date: string) => {
    const response = await api.get(`/api/dreams/${date}`);
    return response.data;
  },

  // ✅ 꿈 해몽 조회
  interpretDream: async (dreamId: number) => {
    console.log('[dreamApi.interpretDream] 호출:', dreamId);

    const response = await api.get(
      `/api/analysis/interpret/${dreamId}`
    );

    console.log('[dreamApi.interpretDream] 응답:', response.data);
    return response.data;
  },

  // ✅ 꿈 수정
  updateDream: async (dreamId: number, data: { 
    interpretation?: string; 
    summary?: string;
  }) => {
    const response = await api.put(`/api/dreams/${dreamId}`, data); 
    return response.data;
  },

  // ✅ AI 영상 생성
  generateVideo: async (dreamId: number) => {
    console.log('[dreamApi.generateVideo] 호출:', dreamId);

    const response = await api.post(`/api/media/generate/video`, null, {
      params: { dreamId }, // @RequestParam 대응
    });

    console.log('[dreamApi.generateVideo] 응답:',response.data);
    return response.data; // MediaResponseDTO
  },

  // ✅ 꿈 요약
  summarizeDream: async (dreamId: number, dreamText: string) => {
    console.log('[dreamApi.summarizeDream] 호출:', { dreamId, dreamText });
  
    const response = await api.post('/api/analysis/summarize', {
      dreamId,
      dreamText,
    });
  
    console.log('[dreamApi.summarizeDream] 응답:', response.data);
    return response.data; // DreamResponseDTO (aiSummary 포함)
  },
};
