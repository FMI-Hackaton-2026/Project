import { useState } from 'react';
import { motion } from 'motion/react';

const AI_PROMPT =
  "I'm here. We are riding this wave together. Right now, what exactly are you feeling in your physical body? (e.g., chest tight, heart racing?)";

export function Phase1BodySensation({
  onComplete,
  onTextSubmit,
}: {
  onComplete: () => void;
  onTextSubmit?: (text: string) => void;
}) {
  const [value, setValue] = useState('');
  const canAdvance = value.trim().length > 0;

  const handleContinue = () => {
    onTextSubmit?.(value.trim());
    onComplete();
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-6 py-8 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="rounded-2xl rounded-bl-md bg-slate-800/80 border border-white/10 px-5 py-4 shadow-lg">
          <p className="text-text-primary text-lg leading-relaxed">{AI_PROMPT}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <label className="block text-sm font-medium text-text-muted sr-only">
          Describe what you feel in your body
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., chest tight, heart racing, fists clenched..."
          rows={3}
          className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-5 py-4 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/30 resize-none transition-all"
          autoFocus
        />
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canAdvance}
          className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-teal-400 transition-all"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
