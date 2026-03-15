import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RichCard } from './RichCard';
import { getSocket } from '../../lib/socket';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface ChatProps {
  mode?: 'onboarding' | 'main';
}

export default function Chat({ mode = 'main' }: ChatProps) {
  const { messages, isTyping, addMessage, appendMessageChunk, setTyping } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showCinematic, setShowCinematic] = React.useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleChunk = (data: { text: string }) => {
      if (data.text) {
        appendMessageChunk(data.text);
      }
    };

    const handleEnd = (data?: { onboarding_complete?: boolean; success?: boolean }) => {
      setTyping(false);
      
      if (mode === 'onboarding' && data?.onboarding_complete) {
        // Trigger 2.5s cinematic wait, then navigate
        setShowCinematic(true);
        setTimeout(() => {
          navigate('/platform/chat', { replace: true });
        }, 2500);
      }
    };

    if (mode === 'onboarding') {
      socket.on('AI_REPLY_CHUNK', handleChunk);
      socket.on('AI_REPLY_END', handleEnd);
    } else {
      socket.on('MAIN_CHAT_CHUNK', handleChunk);
      socket.on('MAIN_CHAT_END', handleEnd);

      // On initial mount of main chat, trigger greeting
      socket.emit('INIT_MAIN_CHAT');
    }

    return () => {
      socket.off('AI_REPLY_CHUNK', handleChunk);
      socket.off('AI_REPLY_END', handleEnd);
      socket.off('MAIN_CHAT_CHUNK', handleChunk);
      socket.off('MAIN_CHAT_END', handleEnd);
    };
  }, [mode, appendMessageChunk, setTyping, navigate]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('message') as string;
    
    if (!text.trim()) return;
    
    addMessage({ sender: 'user', text });
    e.currentTarget.reset();
    
    setTyping(true);
    const socket = getSocket();
    if (socket) {
      if (mode === 'onboarding') {
        socket.emit('SEND_MESSAGE', { message: text });
      } else {
        socket.emit('SEND_MAIN_MESSAGE', { message: text });
      }
    }
  };

  if (showCinematic) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex flex-col justify-center items-center overflow-hidden z-[100]">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary pt-safe pb-[90px]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-medium text-text-primary tracking-wide">Треньор</h1>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div 
                className={cn(
                  "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                  msg.sender === 'user' 
                    ? "bg-slate-700 text-text-primary rounded-br-sm" 
                    : "bg-bg-secondary text-text-primary rounded-bl-sm border border-white/5"
                )}
              >
                {msg.text}
              </div>
              
              {msg.richCard && (
                <div className="mt-2 w-full">
                  <RichCard data={msg.richCard} />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-5 py-4 bg-bg-secondary rounded-2xl rounded-bl-sm w-fit border border-white/5"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-text-muted rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-bg-primary border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            name="message"
            placeholder="Напиши съобщение..."
            className="w-full bg-bg-secondary border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-teal/50 transition-all"
            autoComplete="off"
          />
          <button 
            type="submit"
            className="absolute right-2 p-2 rounded-full bg-slate-700 text-text-primary hover:bg-slate-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
