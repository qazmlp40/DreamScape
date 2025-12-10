import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { DreamService } from '../services/dreamService';

export const ServerStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
    loading: boolean;
  }>({
    connected: false,
    message: '연결 상태 확인 중...',
    loading: true,
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await DreamService.testConnection();
      setConnectionStatus({
        connected: result.connected,
        message: result.message,
        loading: false,
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        message: '연결 테스트 실패',
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRetry = () => {
    checkConnection();
  };

  const showDetails = () => {
    Alert.alert(
      '서버 연결 상태',
      `상태: ${connectionStatus.connected ? '연결됨' : '연결 안됨'}\n메시지: ${connectionStatus.message}`,
      [{ text: '확인' }]
    );
  };

  return (
    <View style={{
      backgroundColor: connectionStatus.connected ? '#10B981' : '#EF4444',
      padding: 12,
      margin: 16,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
          {connectionStatus.loading ? '확인 중...' : 
           connectionStatus.connected ? '서버 연결됨' : '서버 연결 안됨'}
        </Text>
        <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
          {connectionStatus.message}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>재시도</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={showDetails}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>상세</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};