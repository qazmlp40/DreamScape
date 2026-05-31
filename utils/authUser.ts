import { API_BASE_URL, API_JSON_HEADERS } from '@/constants/api';

type MeResponse = {
  userId?: string | number;
  id?: string | number;
  memberId?: string | number;
  email?: string;
};

export async function fetchCurrentUser(accessToken: string) {
  const res = await fetch(`${API_BASE_URL}/t_user/me`, {
    method: 'GET',
    headers: {
      ...API_JSON_HEADERS,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current user: ${res.status}`);
  }

  const data = (await res.json()) as MeResponse;
  const userId = data.userId ?? data.id ?? data.memberId;

  return {
    userId: userId !== undefined ? String(userId) : undefined,
    email: data.email,
  };
}
