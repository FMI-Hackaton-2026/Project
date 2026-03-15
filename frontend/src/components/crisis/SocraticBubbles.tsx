import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SOCRATIC_QUESTIONS = [
  "What specific evidence exists that guarantees this next wager will behave differently than your previous five?",
  "If we look at a transformed image of your life one year from today, free from chasing losses, what does it look like?",
  "What would you tell someone you love if they were in this same moment of urge?",
  "What is one small step you can take right now that your future self will thank you for?",
];

const INTERVAL_MS = 45000; // Show next question every ~45 seconds during breathing

export function SocraticBubbles() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= SOCRATIC_QUESTIONS.length) return;
    const t = setInterval(() => {
      setIndex((i) => Math.min(i + 1, SOCRATIC_QUESTIONS.length - 1));
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [index]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end px-4 pb-32">
      <AnimatePresence mode="wait">
        {SOCRATIC_QUESTIONS[index] && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl rounded-bl-md bg-slate-800/90 border border-white/10 px-4 py-3 shadow-xl max-w-md"
          >
            <p className="text-text-primary text-sm leading-relaxed">
              {SOCRATIC_QUESTIONS[index]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
