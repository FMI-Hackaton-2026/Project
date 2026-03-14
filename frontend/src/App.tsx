/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { Onboarding } from './components/onboarding/Onboarding';
import Chat from './components/chat/Chat';
import Statistics from './components/statistics/Statistics';
import { BottomNav } from './components/navigation/BottomNav';
import { SurgeOverride } from './components/crisis/SurgeOverride';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Login />
              </motion.div>
            } />
            <Route path="/register" element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Register />
              </motion.div>
            } />
            
            <Route path="/platform/onboarding" element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-10"
              >
                <Onboarding />
              </motion.div>
            } />

            <Route path="/platform/chat" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-10"
              >
                <Chat />
              </motion.div>
            } />

            <Route path="/platform/statistics" element={
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-10"
              >
                <Statistics />
              </motion.div>
            } />

            <Route path="/platform" element={<Navigate to="/platform/chat" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {isPlatform && !isOnboarding && <BottomNav />}
      
      <SurgeOverride />
    </div>
  );
}

export default function App() {
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
