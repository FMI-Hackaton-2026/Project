import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { BreathingCircle } from './BreathingCircle';
import { SomaticGrounding } from './SomaticGrounding';

export function SurgeOverride() {
  const { isSurgeActive, deactivateSurge } = useAppStore();
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'grounding' | 'complete'>('intro');

  if (!isSurgeActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-navy-900 flex flex-col overflow-hidden"
      >
        {/* Subtle background noise/gradient for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-800 to-navy-900 opacity-50" />

        <header className="relative z-10 flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3 text-accent-teal">
            <ShieldAlert className="w-6 h-6" />
            <span className="text-sm font-medium tracking-widest uppercase">Lockdown Protocol</span>
          </div>
          <button 
            onClick={deactivateSurge}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
            aria-label="Exit protocol"
          >
            <X className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
          </button>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center px-8"
              >
                <h1 className="text-4xl font-light text-text-primary mb-6">
                  You are safe.
                </h1>
                <p className="text-xl text-text-muted mb-12 max-w-sm mx-auto leading-relaxed">
                  We are going to slow down time. Follow the circle.
                </p>
                <button
                  onClick={() => setPhase('breathing')}
                  className="px-8 py-4 rounded-full bg-accent-teal text-navy-900 font-semibold tracking-wide hover:bg-teal-400 transition-colors"
                >
                  Begin
                </button>
              </motion.div>
            )}

            {phase === 'breathing' && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                <BreathingCircle onComplete={() => setPhase('grounding')} />
              </motion.div>
            )}

            {phase === 'grounding' && (
              <motion.div
                key="grounding"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                <SomaticGrounding onComplete={() => setPhase('complete')} />
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center px-8"
              >
                <div className="w-24 h-24 rounded-full bg-accent-teal/20 flex items-center justify-center mx-auto mb-8">
                  <ShieldAlert className="w-10 h-10 text-accent-teal" />
                </div>
                <h2 className="text-3xl font-light text-text-primary mb-4">
                  Protocol Complete
                </h2>
                <p className="text-lg text-text-muted mb-12 max-w-sm mx-auto leading-relaxed">
                  The urge has passed. You are back in control.
                </p>
                <button
                  onClick={deactivateSurge}
                  className="px-8 py-4 rounded-full bg-white/10 text-text-primary font-medium tracking-wide hover:bg-white/20 transition-colors"
                >
                  Return to Stream
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
