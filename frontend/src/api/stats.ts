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
    const err = new Error(data?.message || data?.data?.message || 'Неуспешно зареждане на статистиката') as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const raw = data.data ?? data;
  return {
    daysFree: Number(raw.daysFree ?? raw.days_free ?? 0) || 0,
    totalSurges: Number(raw.totalSurges ?? raw.total_surges ?? 0) || 0,
    surgeSessionsByWeek: Array.isArray(raw.surgeSessionsByWeek) ? raw.surgeSessionsByWeek : raw.surge_sessions_by_week ?? [],
    urgeRatings: Array.isArray(raw.urgeRatings) ? raw.urgeRatings : raw.urge_ratings ?? [],
    averageUrgeRating: raw.averageUrgeRating != null ? Number(raw.averageUrgeRating) : raw.average_urge_rating != null ? Number(raw.average_urge_rating) : null,
  } as StatsData;
}
