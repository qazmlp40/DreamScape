import { DEV_MOCK_DREAMS } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

type MockDreamRecord = {
  dreamId: number;
  userId: string;
  title: string;
  rawText: string;
  mood: string;
  aiSummary?: string;
  aiInterpretation?: string;
  tags?: string[];
  mediaUrl?: string;
  createdAt: string;
};

let mockDreamIdSeq = 1;
const mockDreamStore = new Map<number, MockDreamRecord>();
const videoGeneratingSet = new Set<number>(); // 진행 중인 영상 생성 dreamId 추적

const getMockDream = (dreamId: number) => mockDreamStore.get(dreamId);

export const getMockDreamById = (dreamId: number) => {
  return mockDreamStore.get(dreamId) ?? null;
};

const buildMockSummary = (dreamText: string) => {
  const trimmed = dreamText.trim();
  if (!trimmed) return "기록된 꿈이 아직 없습니다.";
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
};

const buildMockInterpretation = (mood: string) => {
  const moodLabel = mood || "알 수 없음";
  return `${moodLabel} 감정이 중심이 된 꿈으로 보여요. 지금은 서버 없이 로컬 mock으로 해석 결과를 보여주고 있습니다.`;
};

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
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      throw new Error("userId가 없습니다. 다시 로그인하세요.");
    }

    if (DEV_MOCK_DREAMS) {
      const dreamId = mockDreamIdSeq++;
      const mockDream: MockDreamRecord = {
        dreamId,
        userId,
        title: data.title,
        rawText: data.dreamText,
        mood: data.mood,
        createdAt: new Date().toISOString(),
      };
      mockDreamStore.set(dreamId, mockDream);
      return { dreamId };
    }

    const response = await api.post(`/api/dreams/${userId}`, {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood,
    });
    return response.data;
  },

  // ✅ 사용자 꿈 목록 조회
  getDreams: async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      throw new Error("userId가 없습니다. 다시 로그인하세요.");
    }

    if (DEV_MOCK_DREAMS) {
      return Array.from(mockDreamStore.values()).filter(
        (dream) => dream.userId === userId,
      );
    }

    const response = await api.get(`/api/dreams/user/${userId}`);

    return response.data;
  },

  // ✅ 날짜별 꿈 조회
  getDreamByDate: async (date: string) => {
    if (DEV_MOCK_DREAMS) {
      return (
        Array.from(mockDreamStore.values()).find(
          (dream) => dream.createdAt.slice(0, 10) === date,
        ) ?? null
      );
    }
    const response = await api.get(`/api/dreams/${date}`);
    return response.data;
  },

  getDreamById: async (dreamId: number) => {
    if (DEV_MOCK_DREAMS) {
      return getMockDreamById(dreamId);
    }

    const response = await api.get(`/api/dreams/${dreamId}`);
    return response.data;
  },

  // ✅ 꿈 해몽 조회
  interpretDream: async (dreamId: number) => {
    if (DEV_MOCK_DREAMS) {
      const existing = getMockDream(dreamId);
      const aiInterpretation = buildMockInterpretation(existing?.mood ?? "");
      const tags = existing?.mood ? [existing.mood, "mock"] : ["mock"];

      if (existing) {
        mockDreamStore.set(dreamId, { ...existing, aiInterpretation, tags });
      }

      const mockResponse = { aiInterpretation, tags };
      return mockResponse;
    }

    const response = await api.get(`/api/analysis/interpret/${dreamId}`);
    return response.data;
  },

  // ✅ 꿈 수정
  updateDream: async (
    dreamId: number,
    data: {
      title?: string;
      dreamText?: string;
      mood?: string;
      interpretation?: string;
      summary?: string;
    },
  ) => {
    if (DEV_MOCK_DREAMS) {
      const existing = getMockDream(dreamId);
      if (!existing) return null;
      const updated = {
        ...existing,
        title: data.title ?? existing.title,
        rawText: data.dreamText ?? existing.rawText,
        mood: data.mood ?? existing.mood,
        aiInterpretation: data.interpretation ?? existing.aiInterpretation,
        aiSummary: data.summary ?? existing.aiSummary,
      };
      mockDreamStore.set(dreamId, updated);
      return updated;
    }
    const payload = {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood,
      interpretation: data.interpretation,
      summary: data.summary,
    };
    const response = await api.put(`/api/dreams/${dreamId}`, payload);
    return response.data;
  },

  // ✅ AI 영상 생성
  generateVideo: async (dreamId: number) => {
    if (DEV_MOCK_DREAMS) {
      const existing = getMockDream(dreamId);
      const mockResponse = {
        dreamId,
        mediaUrl: null,
        message: "mock video generation complete",
      };

      if (existing) {
        mockDreamStore.set(dreamId, {
          ...existing,
          mediaUrl: mockResponse.mediaUrl ?? undefined,
        });
      }
      return mockResponse;
    }

    if (videoGeneratingSet.has(dreamId)) {
      throw new Error(`dreamId ${dreamId} 영상 생성이 이미 진행 중입니다.`);
    }

    videoGeneratingSet.add(dreamId);
    try {
      const response = await api.post(`/api/media/generate/video`, null, {
        params: { dreamId },
      });
      return response.data;
    } finally {
      videoGeneratingSet.delete(dreamId);
    }
  },

  // ✅ 꿈 요약
  summarizeDream: async (dreamId: number, dreamText: string) => {
    if (DEV_MOCK_DREAMS) {
      const existing = getMockDream(dreamId);
      const aiSummary = buildMockSummary(dreamText);

      if (existing) {
        mockDreamStore.set(dreamId, {
          ...existing,
          aiSummary,
          rawText: dreamText || existing.rawText,
        });
      }

      const mockResponse = { dreamId, aiSummary, summary: aiSummary };
      return mockResponse;
    }

    const response = await api.post("/api/analysis/summarize", {
      dreamId,
      dreamText,
    });
    return response.data; // DreamResponseDTO (aiSummary 포함)
  },
};
