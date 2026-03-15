import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

const INHALE_DURATION = 4;
const HOLD_DURATION = 4;
const EXHALE_DURATION = 6;
const TARGET_CYCLES = 10;

type Phase = 'inhale' | 'hold' | 'exhale';

export function BreathingCircle({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycles, setCycles] = useState(0);
  const [waitingForTap, setWaitingForTap] = useState(false);

  useEffect(() => {
    if (phase === 'exhale' && waitingForTap) return;
    if (phase === 'inhale') {
      const t = setTimeout(() => setPhase('hold'), INHALE_DURATION * 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'hold') {
      const t = setTimeout(() => {
        setPhase('exhale');
        setWaitingForTap(true);
      }, HOLD_DURATION * 1000);
      return () => clearTimeout(t);
    }
  }, [phase, waitingForTap]);

  const handleTap = useCallback(() => {
    if (phase !== 'exhale' || !waitingForTap) return;
    setWaitingForTap(false);
    const nextCycles = cycles + 1;
    setCycles(nextCycles);
    if (nextCycles >= TARGET_CYCLES) {
      onComplete();
      return;
    }
    setPhase('inhale');
  }, [phase, waitingForTap, cycles, onComplete]);

  const scale = phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 0.6;
  const duration =
    phase === 'inhale'
      ? INHALE_DURATION
      : phase === 'hold'
        ? HOLD_DURATION
        : EXHALE_DURATION;

  return (
    <>
      <motion.button
        type="button"
        onClick={handleTap}
        className="absolute inset-0 w-full h-full cursor-default focus:outline-none touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={phase === 'exhale' ? 'Tap when you exhale' : 'Breathing'}
      >
        <div className="flex flex-col items-center justify-center h-full pointer-events-none">
          <motion.div
            animate={{ scale }}
            transition={{
              duration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="w-48 h-48 rounded-full border-2 border-accent-teal/50 bg-accent-teal/10 flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.15)]"
          >
            <motion.div
              animate={{ scale: scale * 0.7 }}
              transition={{
                duration,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="w-24 h-24 rounded-full bg-accent-teal/20"
            />
          </motion.div>
          <p className="mt-10 text-lg font-light text-text-muted tracking-wide uppercase">
            {phase === 'inhale' && 'Breathe in'}
            {phase === 'hold' && 'Hold'}
            {phase === 'exhale' && (waitingForTap ? 'Tap when you exhale' : 'Breathe out')}
          </p>
          <p className="mt-2 text-sm text-text-muted/70">
            Cycle {cycles + 1} of {TARGET_CYCLES}
          </p>
        </div>
      </motion.button>
    </>
  );
}
