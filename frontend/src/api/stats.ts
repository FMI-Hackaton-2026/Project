import { API_BASE_URL } from './config';

export interface StatsData {
  daysFree: number;
  totalSurges: number;
  surgeSessionsByWeek: { label: string; start: string; end: string; count: number }[];
  urgeRatings: { date: string; rating: number }[];
  averageUrgeRating: number | null;
}

export async function getStats(accessToken: string, refreshToken?: string | null): Promise<StatsData> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (refreshToken) headers['x-refresh-token'] = refreshToken;

  const res = await fetch(`${API_BASE_URL}/stats`, {
    credentials: 'include',
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.message || data?.data?.message || 'Failed to load stats') as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data.data;
}
