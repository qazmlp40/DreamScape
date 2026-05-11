import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';

export const tokenStorage = {
  getToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  deleteToken: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
};
