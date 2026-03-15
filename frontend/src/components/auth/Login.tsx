import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../../api/config';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result?.data?.message || 'Грешка при влизане.');
        return;
      }

      const { accessToken, refreshToken, user } = result.data;
      if (accessToken && refreshToken && user) {
        setAuth(
          {
            id: user.id,
            email: user.email,
            name: user.name ?? user.username,
          },
          accessToken,
          refreshToken
        );
      }

      navigate('/platform/chat');
    } catch {
      setError('Грешка в сървъра. Опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Добре дошли отново</h1>
          <p className="mt-2 text-text-secondary">Продължете пътя си към устойчивост</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Имейл</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Парола</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-bold text-lg hover:bg-teal-400 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Влизане...' : 'Вход'}
          </button>
        </form>

        <p className="text-center text-text-muted">
          Нямате профил?{' '}
          <Link to="/register" className="text-accent-teal hover:underline">
            Регистрация
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
