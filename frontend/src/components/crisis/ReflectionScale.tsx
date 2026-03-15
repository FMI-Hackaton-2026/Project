import { useState } from 'react';
import { motion } from 'motion/react';

const AI_PROMPT =
  'Успешно преминахте най-тежката част от вълната. Оценете от 0 до 10 физическата интензивност на желанието си в момента.';

export function ReflectionScale({ onComplete }: { onComplete: (rating: number) => void }) {
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = () => {
    if (rating !== null) onComplete(rating);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-6 py-8 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="rounded-2xl rounded-bl-md bg-slate-800/80 border border-white/10 px-5 py-4 shadow-lg">
          <p className="text-text-primary text-lg leading-relaxed">{AI_PROMPT}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center gap-2">
          <span className="text-text-muted text-sm font-medium">0 — Без желание</span>
          <span className="text-text-muted text-sm font-medium">10 — Макс. желание</span>
        </div>
        <div className="flex gap-1 sm:gap-2 justify-between">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`flex-1 min-w-[28px] aspect-square rounded-lg font-medium text-sm transition-all ${
                rating === n
                  ? 'bg-accent-teal text-navy-900 scale-110'
                  : 'bg-slate-800/80 text-text-muted hover:bg-slate-700/80 hover:text-text-secondary'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-center text-text-muted text-sm">
          {rating !== null ? `Избрахте ${rating}` : 'Изберете число'}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === null}
          className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-teal-400 transition-all"
        >
          Готово
        </button>
      </motion.div>
    </div>
  );
}
