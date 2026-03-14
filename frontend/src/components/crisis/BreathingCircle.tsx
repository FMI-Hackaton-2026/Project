import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

export function BreathingCircle({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const targetCycles = 3;

  useEffect(() => {
    if (cycles >= targetCycles) {
      onComplete();
      return;
    }

    let timer: NodeJS.Timeout;
    if (phase === 'inhale') {
      timer = setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('exhale'), 4000);
    } else if (phase === 'exhale') {
      timer = setTimeout(() => {
        setPhase('inhale');
        setCycles(c => c + 1);
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, [phase, cycles, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        animate={{
          scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
          opacity: phase === 'hold' ? 0.8 : 1,
        }}
        transition={{
          duration: phase === 'inhale' ? 4 : phase === 'hold' ? 4 : 6,
          ease: "easeInOut"
        }}
        className="w-48 h-48 rounded-full bg-accent-teal/20 border-2 border-accent-teal/50 flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.2)]"
      >
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.8,
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 4 : 6,
            ease: "easeInOut"
          }}
          className="w-32 h-32 rounded-full bg-accent-teal/40 blur-md"
        />
      </motion.div>
      <div className="mt-12 text-2xl font-light text-text-primary tracking-widest uppercase">
        {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}
      </div>
      <div className="mt-4 text-sm text-text-muted">
        Cycle {cycles + 1} of {targetCycles}
      </div>
    </div>
  );
}
