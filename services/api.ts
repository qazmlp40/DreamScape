import { API_BASE_URL, API_JSON_HEADERS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { tokenStorage } from '../utils/tokenStorage';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: API_JSON_HEADERS,
});

api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.deleteToken();
      await AsyncStorage.removeItem('userId');
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);
