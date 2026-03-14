/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Login from './components/auth/Login';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="relative w-full h-screen bg-bg-primary overflow-hidden text-text-primary selection:bg-accent-teal/30">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} className="absolute inset-0">
          <Routes location={location}>
            <Route
              path="/login"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Login />
                </motion.div>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
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
