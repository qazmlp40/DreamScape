import { DEV_MOCK_DREAMS } from "@/constants/api";
import { tokenStorage } from "@/utils/tokenStorage";
import { buildAbsoluteApiUrl } from "@/utils/url";
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
const videoGeneratingPromises = new Map<number, Promise<any>>();
const DREAM_CLIENT_PATCH_STORAGE_KEY = "dreamClientPatches";

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

type DreamClientPatch = {
  title?: string;
  aiSummary?: string;
  aiInterpretation?: string;
  detectedKeywords?: string[];
  mediaUrl?: string;
  videoUrl?: string;
  mediaId?: number;
};

const readDreamClientPatches = async () => {
  const rawValue = await AsyncStorage.getItem(DREAM_CLIENT_PATCH_STORAGE_KEY);
  if (!rawValue) {
    return {} as Record<string, DreamClientPatch>;
  }

  try {
    return JSON.parse(rawValue) as Record<string, DreamClientPatch>;
  } catch {
    return {} as Record<string, DreamClientPatch>;
  }
};

const patchDreamClientCache = async (
  dreamId: number,
  patch: DreamClientPatch,
) => {
  const patches = await readDreamClientPatches();
  patches[String(dreamId)] = {
    ...(patches[String(dreamId)] ?? {}),
    ...patch,
  };
  await AsyncStorage.setItem(
    DREAM_CLIENT_PATCH_STORAGE_KEY,
    JSON.stringify(patches),
  );
};

const mergeDreamClientPatch = async (dream: any) => {
  const dreamId = dream?.dreamId ?? dream?.id ?? dream?.dream_id;
  if (!dreamId) {
    return dream;
  }

  const patches = await readDreamClientPatches();
  return {
    ...dream,
    ...(patches[String(dreamId)] ?? {}),
  };
};

const mergeDreamListClientPatches = async (dreams: any[]) => {
  const patches = await readDreamClientPatches();

  return dreams.map((dream) => {
    const dreamId = dream?.dreamId ?? dream?.id ?? dream?.dream_id;
    return {
      ...dream,
      ...(dreamId ? patches[String(dreamId)] ?? {} : {}),
    };
  });
};

export const dreamApi = {
  // 꿈 생성
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

    console.log("[DreamApi] saveDream request date:", data.date);
    console.log("[DreamApi] saveDream request payload:", {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood,
      recordedAt: data.date
    });

    const response = await api.post(`/api/dreams/${userId}`, {
      title: data.title,
      rawText: data.dreamText,
      mood: data.mood,
      recordedAt: data.date // 캘린더에서 선택한 꿈 날짜
    });

    console.log("[DreamApi] saveDream raw response:", response.data);
    console.log("[DreamApi] saveDream response date:", {
      date: response.data?.date,
      dreamDate: response.data?.dreamDate,
      createdAt: response.data?.createdAt,
    });

    return response.data;
  },

  // 사용자 꿈 목록 조회
  getDreams: async () => {
    const token = await tokenStorage.getToken(); // accessToken
    const userId = await AsyncStorage.getItem("userId");
    console.log("userId:", userId);
    console.log("token 있음?:", Boolean(token));

    if (!token || !userId) { // 토큰 없으면 꿈 목록 조회 못함
      throw new Error("userId가 없습니다. 다시 로그인하세요.");
    }

    if (DEV_MOCK_DREAMS) {
      return Array.from(mockDreamStore.values()).filter(
        (dream) => dream.userId === userId,
      );
    }

    const response = await api.get(`/api/dreams/user/${userId}`);

    return Array.isArray(response.data)
      ? mergeDreamListClientPatches(response.data)
      : response.data;
  },

  // 날짜별 꿈 조회
  getDreamByDate: async (date: string) => {
    if (DEV_MOCK_DREAMS) {
      return (
        Array.from(mockDreamStore.values()).find(
          (dream) => dream.createdAt.slice(0, 10) === date,
        ) ?? null
      );
    }
    const response = await api.get(`/api/dreams/${date}`);
    return mergeDreamClientPatch(response.data);
  },

  getDreamById: async (dreamId: number) => {
    if (DEV_MOCK_DREAMS) {
      return getMockDreamById(dreamId);
    }

    const response = await api.get(`/api/dreams/${dreamId}`);
    return mergeDreamClientPatch(response.data);
  },

  // 꿈 해몽 조회
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

    console.log("[dreamApi] interpretDream request:", dreamId);
    const response = await api.get(`/analysis/interpret/${dreamId}`);
    console.log("[dreamApi] interpretDream response:", response.data);
    await patchDreamClientCache(dreamId, {
      aiInterpretation:
        response.data?.aiInterpretation ??
        response.data?.interpretation ??
        response.data?.analysisText,
      detectedKeywords: response.data?.detectedKeywords ?? response.data?.tags,
    });
    return response.data;
  },

  // 꿈 수정
  updateDream: async (
    dreamId: number,
    data: {
      title?: string;
      dreamText?: string;
      mood?: string;
      interpretation?: string;
      summary?: string;
      videoUrl?: string;
      mediaUrl?: string;
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
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.dreamText !== undefined ? { rawText: data.dreamText } : {}),
      ...(data.mood !== undefined ? { mood: data.mood } : {}),
    };
    console.log("[DreamApi] updateDream request:", {
      dreamId,
      payload,
    });
    const response = await api.put(`/api/dreams/${dreamId}`, payload);
    console.log("[DreamApi] updateDream response:", response.data);
    return response.data;
  },

  // AI 영상 생성
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

    const pendingVideo = videoGeneratingPromises.get(dreamId);
    if (pendingVideo) {
      return pendingVideo;
    }

    const request = (async () => {
      const response = await api.post(`/api/media/generate/video`, null, {
        params: { dreamId },
        timeout: 360000,
      });
      const mediaUrl = buildAbsoluteApiUrl(
        response.data?.mediaUrl ?? response.data?.videoUrl,
      );
      await patchDreamClientCache(dreamId, {
        mediaUrl,
        videoUrl: mediaUrl,
        mediaId: response.data?.mediaId,
      });
      return {
        ...response.data,
        ...(mediaUrl ? { mediaUrl, videoUrl: mediaUrl } : {}),
      };
    })();

    videoGeneratingPromises.set(dreamId, request);

    try {
      return await request;
    } finally {
      videoGeneratingPromises.delete(dreamId);
    }
  },

  // 꿈 요약
  summarizeDream: async (dreamId: number, dreamText?: string) => {
    if (DEV_MOCK_DREAMS) {
      const existing = getMockDream(dreamId);
      const aiSummary = buildMockSummary(dreamText ?? existing?.rawText ?? "");

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

    const response = await api.post(`/analysis/summarize/${dreamId}`);
    await patchDreamClientCache(dreamId, {
      title: response.data?.title,
      aiSummary: response.data?.aiSummary ?? response.data?.summary,
    });
    return response.data; // DreamResponseDTO (aiSummary 포함)
  },
};
