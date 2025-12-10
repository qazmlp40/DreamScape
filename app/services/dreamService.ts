import { DreamEntry } from '../types/dream';
import { API_CONFIG } from '../config';
import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 임시 더미 데이터 (나중에 실제 DB로 교체)
const dummyDreams: DreamEntry[] = [
  { id: '1', date: '2025-07-01', emotion: 'happy', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', date: '2025-07-02', emotion: 'sad', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', date: '2025-07-03', emotion: 'angry', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', date: '2025-07-04', emotion: 'excited', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', date: '2025-07-05', emotion: 'impressed', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', date: '2025-07-06', emotion: 'surprised', createdAt: new Date(), updatedAt: new Date() },
  { id: '7', date: '2025-07-07', emotion: 'happy', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', date: '2025-07-08', emotion: 'happy', createdAt: new Date(), updatedAt: new Date() },
  { id: '9', date: '2025-07-09', emotion: 'sad', createdAt: new Date(), updatedAt: new Date() },
  { id: '10', date: '2025-07-10', emotion: 'angry', createdAt: new Date(), updatedAt: new Date() },
  { id: '11', date: '2025-07-11', emotion: 'excited', createdAt: new Date(), updatedAt: new Date() },
  { id: '12', date: '2025-07-12', emotion: 'impressed', createdAt: new Date(), updatedAt: new Date() },
  { id: '13', date: '2025-07-13', emotion: 'surprised', createdAt: new Date(), updatedAt: new Date() },
  { id: '14', date: '2025-07-14', emotion: 'happy', createdAt: new Date(), updatedAt: new Date() },
  { id: '15', date: '2025-07-15', emotion: 'sad', createdAt: new Date(), updatedAt: new Date() },
  { id: '16', date: '2025-07-17', emotion: 'excited', createdAt: new Date(), updatedAt: new Date() },
  { id: '17', date: '2025-07-20', emotion: 'happy', createdAt: new Date(), updatedAt: new Date() },
  { id: '18', date: '2025-07-21', emotion: 'sad', createdAt: new Date(), updatedAt: new Date() },
  { id: '19', date: '2025-07-22', emotion: 'angry', createdAt: new Date(), updatedAt: new Date() },
  { id: '20', date: '2025-07-23', emotion: 'excited', createdAt: new Date(), updatedAt: new Date() },
];

export class DreamService {
  // 서버 연결 상태 확인
  static async checkServerConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('서버 연결 실패:', error);
      return false;
    }
  }

  // 모든 꿈 데이터 조회
  static async getAllDreams(): Promise<DreamEntry[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DREAMS);
      return response.data;
    } catch (error) {
      console.error('꿈 데이터 조회 실패, 더미 데이터 사용:', error);
      return dummyDreams;
    }
  }

  // 특정 날짜의 꿈 데이터 조회
  static async getDreamByDate(date: string): Promise<DreamEntry | null> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.DREAMS}/${date}`);
      return response.data;
    } catch (error) {
      console.error('특정 날짜 꿈 데이터 조회 실패, 더미 데이터 사용:', error);
      const dream = dummyDreams.find(d => d.date === date);
      return dream || null;
    }
  }

  // 꿈 데이터 생성
  static async createDream(dreamData: Omit<DreamEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DreamEntry> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.DREAMS, dreamData);
      return response.data;
    } catch (error) {
      console.error('꿈 데이터 생성 실패, 로컬에 저장:', error);
      const newDream: DreamEntry = {
        ...dreamData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dummyDreams.push(newDream);
      return newDream;
    }
  }

  // 꿈 데이터 업데이트
  static async updateDream(id: string, updateData: Partial<Omit<DreamEntry, 'id' | 'createdAt'>>): Promise<DreamEntry | null> {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.DREAMS}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('꿈 데이터 업데이트 실패, 로컬에서 처리:', error);
      const index = dummyDreams.findIndex(d => d.id === id);
      if (index === -1) return null;
      
      dummyDreams[index] = {
        ...dummyDreams[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return dummyDreams[index];
    }
  }

  // 꿈 데이터 삭제
  static async deleteDream(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.DREAMS}/${id}`);
      return true;
    } catch (error) {
      console.error('꿈 데이터 삭제 실패, 로컬에서 처리:', error);
      const index = dummyDreams.findIndex(d => d.id === id);
      if (index === -1) return false;
      
      dummyDreams.splice(index, 1);
      return true;
    }
  }

  // 서버 상태 체크 및 연결 테스트
  static async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const isConnected = await this.checkServerConnection();
      if (isConnected) {
        return { connected: true, message: '서버 연결 성공' };
      } else {
        return { connected: false, message: '서버 응답 없음' };
      }
    } catch (error) {
      return { 
        connected: false, 
        message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      };
    }
  }
}