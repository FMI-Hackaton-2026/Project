import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Activity, TrendingDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { getStats, type StatsData } from '../../api/stats';

function is401(e: unknown): e is Error & { status?: number } {
  return e instanceof Error && 'status' in e && (e as Error & { status?: number }).status === 401;
}

export default function Statistics() {
  const navigate = useNavigate();
  const location = useLocation();
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const getRefreshToken = useAuthStore((s) => s.getRefreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const lastSurgeSubmittedAt = useAppStore((s) => s.lastSurgeSubmittedAt);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback((silent = false) => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    getStats(accessToken ?? '', refreshToken)
      .then(setStats)
      .catch((e) => {
        if (is401(e)) {
          clearAuth();
          navigate('/login', { replace: true });
          return;
        }
        if (!silent) setError(e instanceof Error ? e.message : 'Неуспешно зареждане');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [getAccessToken, getRefreshToken, clearAuth, navigate]);

  useEffect(() => {
    if (location.pathname !== '/platform/statistics') return;
    fetchStats();
  }, [location.pathname, lastSurgeSubmittedAt, fetchStats]);

  useEffect(() => {
    const onFocus = () => {
      if (location.pathname === '/platform/statistics') fetchStats(true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [location.pathname, fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-bg-primary pt-safe pt-[calc(env(safe-area-inset-top,20px)+5rem)] pb-8 overflow-y-auto">
        <header className="px-6 py-8 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-2xl font-light text-text-primary tracking-wide">Статистика</h1>
          <p className="text-text-muted mt-1 text-sm">Табло за устойчивост.</p>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted">Зареждане…</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col h-screen bg-bg-primary pt-safe pt-[calc(env(safe-area-inset-top,20px)+5rem)] pb-8 overflow-y-auto">
        <header className="px-6 py-8 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-2xl font-light text-text-primary tracking-wide">Статистика</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-red-400 text-center">{error || 'Неуспешно зареждане на статистиката'}</p>
        </div>
      </div>
    );
  }

  const maxWeekCount = Math.max(1, ...stats.surgeSessionsByWeek.map((w) => w.count));
  const maxUrge = 10;

  return (
    <div className="flex flex-col h-screen bg-bg-primary pt-safe pt-[calc(env(safe-area-inset-top,20px)+5rem)] pb-8 overflow-y-auto">
      <header className="px-6 py-8 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-light text-text-primary tracking-wide">Статистика</h1>
        <p className="text-text-muted mt-1 text-sm">Преглед на психичното здраве и възстановяването.</p>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Days free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 rounded-3xl bg-bg-secondary border border-white/5 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Calendar className="w-24 h-24 text-accent-teal" />
          </div>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Дни без игра
          </h2>
          <div className="text-5xl font-light text-text-primary">
            {stats.daysFree}
          </div>
          <p className="text-text-muted text-sm mt-1">
            {stats.daysFree === 0
              ? 'Задайте дата на последната си игра в настройките за проследяване.'
              : 'Продължавайте. Всеки ден има значение.'}
          </p>
        </motion.div>

        {/* Surge completions by week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 rounded-3xl bg-bg-secondary border border-white/5 shadow-lg"
        >
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Завършени помощни сесии (последни 4 седмици)
          </h2>
          <div className="flex items-end gap-2 h-32">
            {stats.surgeSessionsByWeek.map((week, i) => (
              <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-slate-700/50 rounded-t-lg overflow-hidden flex flex-col justify-end min-h-[40px]"
                  title={`${week.count} завършени`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(week.count / maxWeekCount) * 100}%`,
                    }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-accent-teal/70 rounded-t"
                  />
                </div>
                <span className="text-xs text-text-muted">{week.label}</span>
                <span className="text-sm font-medium text-text-primary">{week.count}</span>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-sm mt-3">
            Общо завършени: <span className="text-text-primary font-medium">{stats.totalSurges}</span>
          </p>
        </motion.div>

        {/* Urge rating trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 rounded-3xl bg-bg-secondary border border-white/5 shadow-lg"
        >
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Интензивност на желанието след Помощ (последни 14)
          </h2>
          {stats.urgeRatings.length === 0 ? (
            <p className="text-text-muted text-sm">Завършете SURGE, за да виждате оценките тук.</p>
          ) : (
            <>
              <div className="flex items-end gap-1 h-24">
                {stats.urgeRatings.slice(-14).map((point, i) => (
                  <motion.div
                    key={`${point.date}-${i}`}
                    initial={{ height: 0 }}
                    animate={{
                      height: `${((point.rating ?? 0) / maxUrge) * 100}%`,
                    }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 min-w-0 bg-accent-teal/50 rounded-t"
                    title={`${point.date}: ${point.rating}/10`}
                  />
                ))}
              </div>
              <p className="text-text-muted text-sm mt-3">
                Средна оценка след помощ:{' '}
                <span className="text-text-primary font-medium">
                  {stats.averageUrgeRating != null
                    ? stats.averageUrgeRating.toFixed(1)
                    : '—'}
                </span>
                /10
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
