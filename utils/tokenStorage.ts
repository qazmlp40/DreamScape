import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';

export const tokenStorage = {
  getToken: async () => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token ?? AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setToken: async (token: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  deleteToken: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
