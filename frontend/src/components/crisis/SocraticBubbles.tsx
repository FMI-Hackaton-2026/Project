import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SOCRATIC_QUESTIONS = [
  "Какво конкретно доказателство има, че следващият залог ще е различен от предишните ви пет?",
  "Ако погледнем преображения ви живот след една година, свободен от гонене на загуби — как изглежда?",
  "Какво бихте казали на близък човек, ако беше в същия момент на желание?",
  "Каква е една малка стъпка, която можете да направите сега и за която бъдещото ви аз ще ви благодари?",
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
