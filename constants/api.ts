import Constants from "expo-constants";
import { Platform } from "react-native";

const getDefaultApiBaseUrl = () => {
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1") {
    return `http://${expoHost}:8080`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }

  return "http://localhost:8080";
};

const expoScheme = Constants.expoConfig?.scheme;

export const APP_SCHEME =
  process.env.EXPO_PUBLIC_APP_SCHEME ??
  (Array.isArray(expoScheme) ? expoScheme[0] : expoScheme) ??
  "dreamscape";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultApiBaseUrl();

export const DEV_MOCK_AUTH = process.env.EXPO_PUBLIC_DEV_MOCK_AUTH === "true";
export const DEV_MOCK_DREAMS = process.env.EXPO_PUBLIC_DEV_MOCK_DREAMS === "true";
