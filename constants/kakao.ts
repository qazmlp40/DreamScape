import { API_BASE_URL } from "./api";

export const KAKAO_APP_KEY =
  process.env.EXPO_PUBLIC_KAKAO_APP_KEY || "dc20c43cdf2f8ffdc24ad4c184a1b6cb";

export const KAKAO_SHARE_WEB_URL =
  process.env.EXPO_PUBLIC_KAKAO_SHARE_WEB_URL?.trim() || undefined;

export const KAKAO_SHARE_IMAGE_URL =
  process.env.EXPO_PUBLIC_KAKAO_SHARE_IMAGE_URL?.trim() ||
  "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png";

const decodeShareValue = (value: string) => {
  let decodedValue = value;

  for (let index = 0; index < 2; index += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(decodedValue)) {
      break;
    }

    try {
      const nextValue = decodeURIComponent(decodedValue);
      if (nextValue === decodedValue) {
        break;
      }
      decodedValue = nextValue;
    } catch {
      break;
    }
  }

  return decodedValue;
};

const getUrlOrigin = (url?: string) => {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

const isBackendUrl = (url?: string) => {
  const shareOrigin = getUrlOrigin(url);
  const apiOrigin = getUrlOrigin(API_BASE_URL);

  return Boolean(shareOrigin && apiOrigin && shareOrigin === apiOrigin);
};

export const buildKakaoSharePageUrl = (params: Record<string, string | undefined>) => {
  if (!KAKAO_SHARE_WEB_URL || isBackendUrl(KAKAO_SHARE_WEB_URL)) {
    return undefined;
  }

  const baseUrl = KAKAO_SHARE_WEB_URL.replace(/\/$/, "");
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => [key, decodeShareValue(String(value))]) as [
      string,
      string,
    ][],
  ).toString();

  return `${baseUrl}${query ? `?${query}` : ""}`;
};
