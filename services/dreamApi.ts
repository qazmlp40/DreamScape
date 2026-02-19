import { api } from './api';

export const dreamApi = {
  saveDream: async (data: {
    date: string;
    title: string;
    dreamText: string;
    mood: string;
    summary?: string;
    interpretation?: string;
  }) => {
    console.log('dreamApi.saveDream 호출:', data);
    const response = await api.post('/api/dreams/1', {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood
    });
    console.log('dreamApi.saveDream 응답:', response.data);
    return response.data;
  },

  getDreams: async () => {
    const response = await api.get('/api/dreams');
    return response.data;
  },

  getDreamByDate: async (date: string) => {
    const response = await api.get(`/api/dreams/${date}`);
    return response.data;
  },

  analyzeDream: async (dreamText: string) => {
    console.log('dreamApi.analyzeDream 호출:', dreamText);
    const response = await api.post('/api/analysis/summarize', dreamText, {
      headers: { 'Content-Type': 'text/plain' }
    });
    console.log('dreamApi.analyzeDream 응답:', response.data);
    return response.data; // { aiSummary: string, dreamId: number }
  },
};
