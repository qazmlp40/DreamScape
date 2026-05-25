import { API_BASE_URL } from "@/constants/api";

export const buildAbsoluteApiUrl = (url?: string | null) => {
  if (!url?.trim()) {
    return undefined;
  }

  const trimmedUrl = url.trim();
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  return `${baseUrl}${path}`;
};
