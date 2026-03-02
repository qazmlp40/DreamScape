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

    console.log('dreamApi.saveDream 호출:', data);

    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('userId가 없습니다. 다시 로그인하세요.');
    }

    console.log('요청 URL:', `/api/dreams/${userId}`);

    const response = await api.post(`/api/dreams/${userId}`, {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood,
    });

    console.log('dreamApi.saveDream 응답:', response.data);

    return response.data;
  },

  getDreams: async () => {
    const userId = await AsyncStorage.getItem('userId');
  
    if (!userId) {
      throw new Error('userId가 없습니다. 다시 로그인하세요.');
    }
  
    const response = await api.get(`/api/dreams/user/${userId}`);
  
    return response.data;
  },

  getDreamByDate: async (date: string) => {
    const response = await api.get(`/api/dreams/${date}`);
    return response.data;
  },

  interpretDream: async (dreamId: number) => {
    console.log('dreamApi.interpretDream 호출:', dreamId);

    const response = await api.get(
      `/api/analysis/interpret/${dreamId}`
    );

    console.log('dreamApi.interpretDream 응답:', response.data);

    return response.data;
  },

  updateDream: async (dreamId: number, data: {
    interpretation?: string;
    summary?: string;
  }) => {
    const response = await api.put(`/api/dreams/${dreamId}`, data);
    return response.data;
  },

  generateVideo: async (dreamId: number) => {
    const response = await api.post(`/api/media/generate/video`, null, {
      params: { dreamId }, // ✅ @RequestParam 대응
    });
    return response.data; // MediaResponseDTO
  },
};
