export const KAKAO_APP_KEY =
  process.env.EXPO_PUBLIC_KAKAO_APP_KEY || "dc20c43cdf2f8ffdc24ad4c184a1b6cb";

export const KAKAO_SHARE_WEB_URL =
  process.env.EXPO_PUBLIC_KAKAO_SHARE_WEB_URL?.trim() || undefined;

export const KAKAO_SHARE_IMAGE_URL =
  process.env.EXPO_PUBLIC_KAKAO_SHARE_IMAGE_URL?.trim() ||
  "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png";

export const buildKakaoSharePageUrl = (params: Record<string, string | undefined>) => {
  if (!KAKAO_SHARE_WEB_URL) {
    return undefined;
  }

  const baseUrl = KAKAO_SHARE_WEB_URL.replace(/\/$/, "");
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();

  return `${baseUrl}${query ? `?${query}` : ""}`;
};
