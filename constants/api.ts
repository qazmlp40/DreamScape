import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "https://bootleg-defiling-legume.ngrok-free.dev";


const expoScheme = Constants.expoConfig?.scheme;

export const APP_SCHEME =
  process.env.EXPO_PUBLIC_APP_SCHEME ??
  (Array.isArray(expoScheme) ? expoScheme[0] : expoScheme) ??
  "dreamscape";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const shouldSkipNgrokWarning = API_BASE_URL.includes("ngrok-free.dev");

export const API_JSON_HEADERS = {
  "Content-Type": "application/json",
  ...(shouldSkipNgrokWarning ? { "ngrok-skip-browser-warning": "true" } : {}),
};

export const DEV_MOCK_AUTH = process.env.EXPO_PUBLIC_DEV_MOCK_AUTH === "true";
export const DEV_MOCK_DREAMS = process.env.EXPO_PUBLIC_DEV_MOCK_DREAMS === "true";
