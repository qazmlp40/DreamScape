// API 서버 설정
export const API_CONFIG = {
  // 개발 환경
  DEV_BASE_URL: 'http://localhost:3000/api',
  
  // 프로덕션 환경 (실제 서버 주소로 변경 필요)
  PROD_BASE_URL: 'https://your-server.com/api',
  
  // 현재 환경에 따른 BASE_URL
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://your-server.com/api',
  
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
    const response = await fetch(API_CONFIG.BASE_URL + '/health', {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Network connection failed:', error);
    return false;
  }
};