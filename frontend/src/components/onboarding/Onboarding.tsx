import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useSocketStore } from '../../store/useSocketStore';
import { getSocket } from '../../lib/socket';
import { cn } from '../../lib/utils';

type OnboardingStep = 'chat' | 'transition';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'ai',
  text: 'Здравейте. Аз съм Вашият треньор. Как да ви наричам?',
};

const RESPONSE_TIMEOUT_MS = 60000;
/** Minimum time (ms) to show the last message + welcome before transitioning to /platform/chat */
const LAST_MESSAGE_READ_MS = 5000;

export function Onboarding() {
  const { addMessage } = useAppStore();
  const socketConnected = useSocketStore((s) => s.connected);
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AI_MESSAGE]);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [socketError, setSocketError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef(streamingText);
  const lastAiMessageRef = useRef<string | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedOnboardingRef = useRef(false);
  const transitionDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  streamingRef.current = streamingText;

  const clearResponseTimeout = () => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isTyping]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socketConnected) {
      if (!socket) setSocketError('Изчакване на свързване...');
      else setSocketError(null);
      return;
    }
    setSocketError(null);

    const onChunk = (payload: { text?: string }) => {
      if (payload.text) setStreamingText((prev) => prev + payload.text);
    };

    const onSendMessage = (payload: { message?: string }) => {
      clearResponseTimeout();
      if (payload.message) {
        lastAiMessageRef.current = payload.message;
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: 'ai', text: payload.message! },
        ]);
        setStreamingText('');
      }
      setIsTyping(false);
    };

    const finishOnboarding = () => {
      if (hasFinishedOnboardingRef.current) return;
      hasFinishedOnboardingRef.current = true;
      const finalText = streamingRef.current || lastAiMessageRef.current;
      if (finalText) addMessage({ sender: 'ai', text: finalText });
      const welcomeText = "Добре дошли във вашето пространство. Тук съм, когато ви трябва разговор, издухване или префокусиране.";
      addMessage({ sender: 'ai', text: welcomeText });
      lastAiMessageRef.current = null;
      // Show welcome message in chat
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: 'ai', text: welcomeText },
      ]);
      // Stay on chat for at least 5 seconds so the user can read the last message
      transitionDelayRef.current = setTimeout(() => {
        transitionDelayRef.current = null;
        setStep('transition');
      }, LAST_MESSAGE_READ_MS);
    };

    const onReplyEnd = (payload: { onboarding_complete?: boolean }) => {
      clearResponseTimeout();
      const text = streamingRef.current;
      if (text) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: 'ai', text },
        ]);
        setStreamingText('');
      }
      setIsTyping(false);

      // Only leave onboarding when backend explicitly signals end (e.g. after MAX_TURNS)
      if (payload.onboarding_complete === true) {
        finishOnboarding();
      }
    };

    const onEndMessage = () => {
      clearResponseTimeout();
      setIsTyping(false);
      finishOnboarding();
    };

    const onError = (payload: { event?: string; message?: string }) => {
      clearResponseTimeout();
      setSocketError(payload?.message || 'Грешка при изпращане.');
      setIsTyping(false);
      setStreamingText('');
    };

    socket.on('AI_REPLY_CHUNK', onChunk);
    socket.on('SEND_MESSAGE', onSendMessage);
    socket.on('AI_REPLY_END', onReplyEnd);
    socket.on('END_MESSAGE', onEndMessage);
    socket.on('error', onError);

    return () => {
      clearResponseTimeout();
      if (transitionDelayRef.current) {
        clearTimeout(transitionDelayRef.current);
        transitionDelayRef.current = null;
      }
      socket.off('AI_REPLY_CHUNK', onChunk);
      socket.off('SEND_MESSAGE', onSendMessage);
      socket.off('AI_REPLY_END', onReplyEnd);
      socket.off('END_MESSAGE', onEndMessage);
      socket.off('error', onError);
    };
  }, [addMessage, socketConnected]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const socket = getSocket();
    if (!socket) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'user', text },
    ]);
    setInputValue('');
    setStreamingText('');
    setSocketError(null);
    setIsTyping(true);

    clearResponseTimeout();
    responseTimeoutRef.current = setTimeout(() => {
      responseTimeoutRef.current = null;
      setIsTyping(false);
      setSocketError('Няма отговор от сървъра. Опитайте отново.');
    }, RESPONSE_TIMEOUT_MS);

    socket.emit('SEND_MESSAGE', { message: text, sessionId: 'onboarding' });
  };

  useEffect(() => {
    if (step === 'transition') {
      const timer = setTimeout(() => navigate('/platform/chat'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto h-full flex flex-col px-4 py-6"
          >
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'flex flex-col max-w-[85%]',
                      msg.sender === 'user'
                        ? 'ml-auto items-end'
                        : 'mr-auto items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-3 rounded-2xl text-[15px] leading-relaxed',
                        msg.sender === 'user'
                          ? 'bg-slate-700 text-text-primary rounded-br-sm'
                          : 'bg-bg-secondary text-text-primary rounded-bl-sm border border-white/5'
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {streamingText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-[85%] mr-auto items-start"
                >
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-bg-secondary text-text-primary border border-white/5 text-[15px] leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-2 h-4 ml-0.5 bg-accent-teal/80 animate-pulse align-middle" />
                  </div>
                </motion.div>
              )}

              {isTyping && !streamingText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-bg-secondary rounded-2xl rounded-bl-sm w-fit border border-white/5"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="w-1.5 h-1.5 bg-text-muted rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>

            {socketError && (
              <p className="text-sm text-amber-400/90 px-1 pb-1">{socketError}</p>
            )}

            <form
              onSubmit={handleChatSubmit}
              className="pt-2 flex-shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Напишете отговора си..."
                disabled={!getSocket() || !socketConnected}
                className="w-full bg-bg-secondary border border-white/10 rounded-full pl-4 pr-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-teal/50 disabled:opacity-60 transition-all"
                autoFocus
              />
            </form>
          </motion.div>
        )}

        {step === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180],
                borderRadius: ['20%', '50%', '20%'],
              }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                times: [0, 0.5, 1],
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
