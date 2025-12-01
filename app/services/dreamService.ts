import { DreamEntry } from '../types/dream';

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
  // 모든 꿈 데이터 조회
  static async getAllDreams(): Promise<DreamEntry[]> {
    // TODO: 실제 DB 연동 시 여기를 교체
    return Promise.resolve(dummyDreams);
  }

  // 특정 날짜의 꿈 데이터 조회
  static async getDreamByDate(date: string): Promise<DreamEntry | null> {
    // TODO: 실제 DB 연동 시 여기를 교체
    const dream = dummyDreams.find(d => d.date === date);
    return Promise.resolve(dream || null);
  }

  // 꿈 데이터 생성
  static async createDream(dreamData: Omit<DreamEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DreamEntry> {
    // TODO: 실제 DB 연동 시 여기를 교체
    const newDream: DreamEntry = {
      ...dreamData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dummyDreams.push(newDream);
    return Promise.resolve(newDream);
  }

  // 꿈 데이터 업데이트
  static async updateDream(id: string, updateData: Partial<Omit<DreamEntry, 'id' | 'createdAt'>>): Promise<DreamEntry | null> {
    // TODO: 실제 DB 연동 시 여기를 교체
    const index = dummyDreams.findIndex(d => d.id === id);
    if (index === -1) return Promise.resolve(null);
    
    dummyDreams[index] = {
      ...dummyDreams[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return Promise.resolve(dummyDreams[index]);
  }

  // 꿈 데이터 삭제
  static async deleteDream(id: string): Promise<boolean> {
    // TODO: 실제 DB 연동 시 여기를 교체
    const index = dummyDreams.findIndex(d => d.id === id);
    if (index === -1) return Promise.resolve(false);
    
    dummyDreams.splice(index, 1);
    return Promise.resolve(true);
  }
}