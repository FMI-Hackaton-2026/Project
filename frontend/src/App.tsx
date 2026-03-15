/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { initSocket, disconnectSocket } from './lib/socket';
import { Onboarding } from './components/onboarding/Onboarding';
import Chat from './components/chat/Chat';
import Statistics from './components/statistics/Statistics';
import { BottomNav } from './components/navigation/BottomNav';
import { SurgeOverride } from './components/crisis/SurgeOverride';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
import { LogoutButton } from './components/auth/LogoutButton';

function AnimatedRoutes() {
  const location = useLocation();
  const { isSurgeActive } = useAppStore();

  const isPlatform = location.pathname.startsWith('/platform');
  const isOnboarding = location.pathname === '/platform/onboarding';

  return (
    <div className="relative w-full h-screen bg-bg-primary overflow-hidden text-text-primary selection:bg-accent-teal/30">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} className="absolute inset-0">
          <Routes location={location}>
            <Route path="/login" element={
              <GuestRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Login />
                </motion.div>
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute redirectTo="/platform/onboarding">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Register />
                </motion.div>
              </GuestRoute>
            } />
            
            <Route path="/platform/onboarding" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-10"
                >
                  <Onboarding />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/platform/chat" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-10"
                >
                  <Chat />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/platform/statistics" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-10"
                >
                  <Statistics />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/platform" element={<Navigate to="/platform/chat" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {isPlatform && !isOnboarding && (
        <AnimatePresence>
          {!isSurgeActive && (
            <motion.header
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 z-40 pt-safe pt-4 pb-3 px-4"
            >
              <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
                <div className="flex-1 flex items-center min-w-0">
                  <span className="text-lg font-medium text-text-primary truncate">КомарСтоп</span>
                </div>
                <div className="flex-shrink-0">
                  <BottomNav />
                </div>
                <div className="flex-1 flex items-center justify-end min-w-0">
                  <LogoutButton />
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>
      )}
      
      <SurgeOverride />
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const getRefreshToken = useAuthStore((s) => s.getRefreshToken);

  // Socket: connect when authenticated, disconnect on logout
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken) {
      initSocket(accessToken, refreshToken);
    }
    return () => disconnectSocket();
  }, [isAuthenticated, getAccessToken, getRefreshToken]);

  // Prevent scrolling on the body to maintain app-like feel
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
