import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAppStore, SURGE_DURATION_MS } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Phase1BodySensation } from './Phase1BodySensation';
import { SensoryOverload } from './SensoryOverload';
import { BreathingCircle } from './BreathingCircle';
import { SocraticBubbles } from './SocraticBubbles';
import { ReflectionScale } from './ReflectionScale';
import { containsCrisisLanguage, CRISIS_RESOURCES } from './crisisMonitor';
import { submitSurge } from '../../api/surge';

type SurgePhase = 1 | 2 | 3 | 4 | 5;

function is401(e: unknown): e is Error & { status?: number } {
  return e instanceof Error && 'status' in e && (e as Error & { status?: number }).status === 401;
}

export function SurgeOverride() {
  const navigate = useNavigate();
  const { isSurgeActive, deactivateSurge, surgeStartedAt, setSurgeSubmitted } = useAppStore();
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const getRefreshToken = useAuthStore((s) => s.getRefreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [phase, setPhase] = useState<SurgePhase>(1);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [surgePayload, setSurgePayload] = useState<{ bodySensation?: string; urgeRating?: number }>({});

  useEffect(() => {
    if (!isSurgeActive || !surgeStartedAt) return;
    const update = () => {
      const elapsed = Date.now() - surgeStartedAt;
      setProgress(Math.min(elapsed / SURGE_DURATION_MS, 1));
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [isSurgeActive, surgeStartedAt]);

  const checkCrisis = useCallback((text: string) => {
    if (containsCrisisLanguage(text)) setShowCrisisModal(true);
  }, []);

  if (!isSurgeActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] bg-[#05080d] flex flex-col overflow-hidden"
      >
        {/* Subtle top progress (20-min window, no countdown) */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-[110] bg-slate-800/80 overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full bg-accent-teal/60 transition-[width] duration-[500ms] ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Close button with confirmation */}
        <div className="absolute top-4 right-4 z-[110] pt-safe">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Изход от интервенцията"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <main className="relative flex-1 flex flex-col min-h-0 pt-14">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col min-h-0"
              >
                <Phase1BodySensation
                  onComplete={() => setPhase(2)}
                  onTextSubmit={checkCrisis}
                  onBodySensation={(text) => setSurgePayload((p) => ({ ...p, bodySensation: text }))}
                />
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col min-h-0 overflow-auto"
              >
                <SensoryOverload
                  onComplete={() => setPhase(3)}
                  onTextSubmit={checkCrisis}
                />
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col"
              >
                <BreathingCircle onComplete={() => setPhase(4)} />
                <SocraticBubbles />
              </motion.div>
            )}

            {phase === 4 && (
              <motion.div
                key="phase4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 flex items-center justify-center px-6">
                  <p className="text-text-muted text-center text-lg max-w-sm">
                    Завършихте дишания цикъл. Още една стъпка.
                  </p>
                </div>
                <div className="p-6">
                  <button
                    type="button"
                    onClick={() => setPhase(5)}
                    className="w-full py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold hover:bg-teal-400 transition-all"
                  >
                    Оценете желанието си
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 5 && !showComplete && (
              <motion.div
                key="phase5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col min-h-0 overflow-auto"
              >
                <ReflectionScale
                  onComplete={(rating) => {
                    setSurgePayload((p) => ({ ...p, urgeRating: rating }));
                    setShowComplete(true);
                  }}
                />
              </motion.div>
            )}

            {phase === 5 && showComplete && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col items-center justify-center px-6"
              >
                <p className="text-xl font-light text-text-primary text-center mb-2">
                  Успяхте.
                </p>
                <p className="text-text-muted text-center mb-8">
                  Вълната мина. Можете да започнете отново по всяко време.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const accessToken = getAccessToken();
                    const refreshToken = getRefreshToken();
                    const durationMs = surgeStartedAt ? Date.now() - surgeStartedAt : undefined;
                    if (accessToken || refreshToken) {
                      try {
                        await submitSurge(
                          { ...surgePayload, durationMs },
                          accessToken ?? '',
                          refreshToken
                        );
                        setSurgeSubmitted();
                      } catch (e) {
                        if (is401(e)) {
                          clearAuth();
                          deactivateSurge();
                          navigate('/login', { replace: true });
                          return;
                        }
                      }
                    }
                    deactivateSurge();
                  }}
                  className="px-8 py-4 rounded-xl bg-accent-teal text-navy-900 font-semibold hover:bg-teal-400 transition-colors"
                >
                  Обратно в приложението
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Exit confirmation modal */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[120] bg-black/80 flex items-center justify-center p-6"
              onClick={() => setShowExitConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Изход от интервенцията?
                </h3>
                <p className="text-text-secondary text-sm mb-6">
                  Вълната ще мине — можете да започнете отново по всяко време с SURGE.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-text-primary font-medium hover:bg-white/15 transition-colors"
                  >
                    Отказ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      deactivateSurge();
                    }}
                    className="flex-1 py-3 rounded-xl bg-accent-teal text-navy-900 font-semibold hover:bg-teal-400 transition-colors"
                  >
                    Изход
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crisis escalation modal */}
        <AnimatePresence>
          {showCrisisModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[120] bg-black/80 flex items-center justify-center p-6"
              onClick={() => setShowCrisisModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {CRISIS_RESOURCES.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {CRISIS_RESOURCES.message}
                </p>
                <a
                  href={`tel:${CRISIS_RESOURCES.hotline}`}
                  className="block w-full py-3 rounded-xl bg-accent-teal text-navy-900 font-semibold text-center hover:bg-teal-400 transition-colors mb-2"
                >
                  {CRISIS_RESOURCES.hotlineLabel}
                </a>
                <p className="text-text-muted text-xs text-center">
                  {CRISIS_RESOURCES.hotlineSub}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCrisisModal(false)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-white/10 text-text-primary text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Затвори
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
