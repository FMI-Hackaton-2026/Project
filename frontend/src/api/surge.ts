import { API_BASE_URL } from './config';

export interface SurgePayload {
  bodySensation?: string;
  urgeRating?: number;
  durationMs?: number;
}

export async function submitSurge(
  payload: SurgePayload,
  accessToken: string,
  refreshToken?: string | null
): Promise<{ success: boolean }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (refreshToken) headers['x-refresh-token'] = refreshToken;

  const res = await fetch(`${API_BASE_URL}/surge`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.message || data?.data?.message || 'Failed to submit') as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}
