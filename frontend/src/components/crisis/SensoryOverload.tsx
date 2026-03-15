import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

const STEPS = [
  { count: 5, label: 'неща, които виждате', placeholder: 'Виждам...', sub: 'Напишете 5 различни визуални наблюдения в стаята си.' },
  { count: 4, label: 'неща, които можете да пипнете', placeholder: 'Усещам (текстура)...', sub: 'Пипнете 4 предмета и напишете текстурите им.' },
  { count: 3, label: 'звуци, които чувате', placeholder: 'Чувам...', sub: 'Назовете 3 звука около вас.' },
  { count: 2, label: 'миризми, които усещате', placeholder: 'Мириша...', sub: 'Назовете 2 миризми.' },
  { count: 1, label: 'вкус, който усещате', placeholder: 'Вкусвам...', sub: 'Назовете 1 вкус (или си представете).' },
];

export function SensoryOverload({
  onComplete,
  onTextSubmit,
}: {
  onComplete: () => void;
  onTextSubmit?: (text: string) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>(() =>
    Array(STEPS[0].count).fill('')
  );

  const step = STEPS[currentStep];

  const allFilled = inputs.every((i) => i.trim().length > 0);

  const handleNext = () => {
    inputs.forEach((t) => t.trim() && onTextSubmit?.(t.trim()));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setInputs(Array(STEPS[currentStep + 1].count).fill(''));
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-light text-text-primary tracking-tight">
              {step.count} {step.label}
            </h2>
            <p className="text-text-muted mt-1 text-sm">{step.sub}</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pb-6">
            {inputs.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <input
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const next = [...inputs];
                    next[idx] = e.target.value;
                    setInputs(next);
                  }}
                  placeholder={`${step.placeholder} ${idx + 1}`}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal/50 transition-all"
                />
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!allFilled}
            className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold disabled:opacity-40 disabled:pointer-events-none hover:bg-teal-400 transition-all flex items-center justify-center gap-2"
          >
            {currentStep === STEPS.length - 1 ? 'Напред' : 'Следващо'}
            {allFilled && <Check className="w-5 h-5" />}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
