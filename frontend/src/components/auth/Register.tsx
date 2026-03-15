import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../../api/config';
import { useAuthStore } from '../../store/useAuthStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const registerResult = await registerRes.json();

      if (!registerRes.ok || !registerResult.success) {
        setError(registerResult?.data?.message || 'Грешка при регистрация.');
        return;
      }

      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const loginResult = await loginRes.json();

      if (!loginRes.ok || !loginResult.success) {
        setError(loginResult?.data?.message || 'Грешка при влизане след регистрация.');
        return;
      }

      const { accessToken, refreshToken, user } = loginResult.data;

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

      navigate('/platform/onboarding');
    } catch (err) {
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
          <h1 className="text-4xl font-bold tracking-tight text-white">Създаване на профил</h1>
          <p className="mt-2 text-text-secondary">Започнете пътя си към възстановяване днес</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Имейл
              </label>
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
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Парола
              </label>
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
            {loading ? 'Създаване...' : 'Създай профил'}
          </button>
        </form>

        <p className="text-center text-text-muted">
          Вече имате профил?{' '}
          <Link to="/login" className="text-accent-teal hover:underline">
            Вход
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
