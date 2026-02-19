// API 서버 설정
export const API_CONFIG = {
  // 개발 환경
  DEV_BASE_URL: '192.168.45.41:8080',
  
  // 프로덕션 환경 (실제 서버 주소로 변경 필요)
  PROD_BASE_URL: '192.168.45.41:8080',
  
  // 현재 환경에 따른 BASE_URL
  BASE_URL: __DEV__ ? '192.168.45.41:8080' : '192.168.45.41:8080',
  
  // 타임아웃 설정
  TIMEOUT: 10000,
  
  // 엔드포인트
  ENDPOINTS: {
    DREAMS: '/dreams',
    UPLOAD: '/upload',
    AUTH: '/auth',
  }
};

// 네트워크 상태 확인
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(API_CONFIG.BASE_URL + '/health', {
      method: 'GET',
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.error('Network connection failed:', error);
    return false;
  }
};