import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd validate here
    navigate('/platform/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-text-secondary">Continue your journey to resilience</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
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
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
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

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-bold text-lg hover:bg-teal-400 transition-colors shadow-lg"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-teal hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
