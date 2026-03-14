import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

const steps = [
  { count: 5, label: "things you can see", placeholder: "I see..." },
  { count: 4, label: "things you can physically feel", placeholder: "I feel..." },
  { count: 3, label: "things you can hear", placeholder: "I hear..." },
  { count: 2, label: "things you can smell", placeholder: "I smell..." },
  { count: 1, label: "thing you can taste", placeholder: "I taste..." },
];

export function SomaticGrounding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>(Array(steps[0].count).fill(''));

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
      setInputs(Array(steps[currentStep + 1].count).fill(''));
    } else {
      onComplete();
    }
  };

  const allFilled = inputs.every(i => i.trim().length > 0);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto px-6 py-12">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-light text-text-primary tracking-tight">
            Name {step.count}
          </h2>
          <p className="text-xl text-text-muted mt-2">
            {step.label}
          </p>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pb-20">
          {inputs.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <input
                type="text"
                value={val}
                onChange={(e) => {
                  const newInputs = [...inputs];
                  newInputs[idx] = e.target.value;
                  setInputs(newInputs);
                }}
                placeholder={`${step.placeholder} ${idx + 1}`}
                className="w-full bg-bg-secondary/50 border border-white/10 rounded-xl px-5 py-4 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal/50 focus:bg-bg-secondary transition-all"
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          disabled={!allFilled}
          onClick={handleNext}
          className="mt-auto w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold disabled:opacity-50 disabled:bg-slate-700 disabled:text-text-muted transition-all flex items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
          {allFilled && <Check className="w-5 h-5" />}
        </motion.button>
      </motion.div>
    </div>
  );
}
