import { motion } from 'motion/react';
import { PlayCircle, FileText, Activity } from 'lucide-react';
import { RichCardData } from '../../types';

interface RichCardProps {
  data: RichCardData;
}

export function RichCard({ data }: RichCardProps) {
  const Icon = data.type === 'video' ? PlayCircle : data.type === 'exercise' ? Activity : FileText;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm overflow-hidden rounded-2xl bg-bg-secondary border border-white/5 shadow-lg mt-2 mb-4"
    >
      {data.thumbnailUrl && (
        <div className="relative h-40 w-full overflow-hidden bg-slate-800">
          <img 
            src={data.thumbnailUrl} 
            alt={data.title} 
            className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent" />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-bg-tertiary text-accent-teal">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text-primary leading-tight">
              {data.title}
            </h4>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>
        
        <button 
          className="mt-5 w-full py-3 px-4 rounded-xl bg-bg-tertiary hover:bg-slate-700 transition-colors text-sm font-medium text-text-primary flex items-center justify-center gap-2"
        >
          {data.actionText}
        </button>
      </div>
    </motion.div>
  );
}
