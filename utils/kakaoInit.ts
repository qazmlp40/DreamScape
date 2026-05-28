import Constants from "expo-constants";
import { KAKAO_APP_KEY } from "../constants/kakao";

export const initKakao = () => {
  if (!KAKAO_APP_KEY || Constants.appOwnership === "expo") {
    return;
  }

  import("@react-native-kakao/core")
    .then(({ initializeKakaoSDK }) => {
      initializeKakaoSDK(KAKAO_APP_KEY);
    })
    .catch((error) => {
      console.warn("카카오 SDK 초기화 생략:", error);
    });
};
