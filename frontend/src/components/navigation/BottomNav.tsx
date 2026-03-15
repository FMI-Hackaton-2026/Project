import { motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { triggerSurge } = useAppStore();
  const location = useLocation();

  return (
    <div className="flex items-center justify-between p-1.5 rounded-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
        
        {/* Left: Chat */}
        <NavLink 
          to="/platform/chat"
          className={({ isActive }) => cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex-1 text-center",
            isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          {location.pathname === '/platform/chat' && (
            <motion.div 
              layoutId="nav-pill"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white/10 rounded-full"
            />
          )}
          <span className="relative z-10">
            Чат
          </span>
        </NavLink>

        {/* Center: SURGE Button */}
        <button
          onClick={triggerSurge}
          className="relative group mx-1 px-2 py-1 flex items-center justify-center"
        >
          <motion.div 
            animate={{ 
              boxShadow: ['0 0 0px rgba(45,212,191,0)', '0 0 20px rgba(45,212,191,0.3)', '0 0 0px rgba(45,212,191,0)']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
          />
          <div className="relative px-4 py-2 rounded-full bg-accent-teal text-navy-900 font-bold tracking-widest text-xs uppercase shadow-lg group-hover:bg-teal-400 transition-colors">
            Помощ
          </div>
        </button>

        {/* Right: Statistics */}
        <NavLink 
          to="/platform/statistics"
          className={({ isActive }) => cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex-1 text-center",
            isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          {location.pathname === '/platform/statistics' && (
            <motion.div 
              layoutId="nav-pill"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white/10 rounded-full"
            />
          )}
          <span className="relative z-10">
            Статистика
          </span>
        </NavLink>
    </div>
  );
}
