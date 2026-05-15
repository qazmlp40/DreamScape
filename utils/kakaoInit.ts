import { initializeKakaoSDK } from "@react-native-kakao/core";
import { KAKAO_APP_KEY } from "../constants/kakao";

export const initKakao = () => {
  if (KAKAO_APP_KEY) {
    initializeKakaoSDK(KAKAO_APP_KEY);
  }
};
