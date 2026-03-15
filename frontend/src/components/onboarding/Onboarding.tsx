import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

type OnboardingStep = 'chat' | 'transition';

export function Onboarding() {
  const { updateProfile, addMessage } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('chat');
  const [chatPhase, setChatPhase] = useState(1);
  const [inputValue, setInputValue] = useState('');

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (chatPhase === 1) {
      updateProfile({ name: inputValue });
      setInputValue('');
      setChatPhase(2);
    } else if (chatPhase === 2) {
      updateProfile({ hobbies: [inputValue] });
      setInputValue('');
      setChatPhase(3);
    } else if (chatPhase === 3) {
      updateProfile({ financialGoals: [inputValue], isProfileComplete: true });
      setInputValue('');
      setStep('transition');
      
      // Add initial message to stream
      setTimeout(() => {
        addMessage({
          sender: 'ai',
          text: "Добре дошли във вашето пространство. Тук съм, когато ви трябва разговор, издухване или префокусиране."
        });
      }, 3000);
    }
  };

  useEffect(() => {
    if (step === 'transition') {
      const timer = setTimeout(() => {
        navigate('/platform/chat');
      }, 2500); // Exactly 2.5 seconds cinematic transition
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col justify-center items-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto h-full flex flex-col px-6 py-12"
          >
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <AnimatePresence>
                {chatPhase >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-2xl font-light text-text-primary leading-relaxed"
                  >
                    Здравейте. Аз съм Вашият треньор. Как да ви наричам?
                  </motion.div>
                )}
                {chatPhase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-2xl font-light text-text-primary leading-relaxed"
                  >
                    Приятно ми е. Когато сте в добра форма, какво обичате да правите?
                  </motion.div>
                )}
                {chatPhase >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-2xl font-light text-text-primary leading-relaxed"
                  >
                    И каква е основната ви финансова цел в момента?
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              onSubmit={handleChatSubmit}
              className="mt-auto relative"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Напишете отговора си..."
                className="w-full bg-transparent border-b-2 border-white/10 py-4 text-xl text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent-teal transition-colors"
                autoFocus
              />
            </motion.form>
          </motion.div>
        )}

        {step === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180],
                borderRadius: ["20%", "50%", "20%"]
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
              className="w-16 h-16 bg-accent-teal/20 border border-accent-teal/40 mb-8"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-text-muted tracking-widest uppercase text-sm font-medium"
            >
              Подготвяме вашето пространство...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
