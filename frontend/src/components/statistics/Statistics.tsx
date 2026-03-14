import { motion } from 'motion/react';
import { Shield, Activity, Target, Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function Statistics() {
  const { userProfile } = useAppStore();

  return (
    <div className="flex flex-col h-screen bg-bg-primary pt-safe pb-[90px] overflow-y-auto">
      <header className="px-6 py-8 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-light text-text-primary tracking-wide">Statistics</h1>
        <p className="text-text-muted mt-1 text-sm">Your resilience dashboard.</p>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Resilience Score */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 rounded-3xl bg-bg-secondary border border-white/5 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Shield className="w-24 h-24 text-accent-teal" />
          </div>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-2">Resilience Score</h2>
          <div className="text-6xl font-light text-text-primary mb-4">
            {userProfile.resilienceScore || 0}
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-accent-teal" />
              <span>{userProfile.daysWithoutGambling || 0} Days Clear</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-accent-blue" />
              <span>{userProfile.completedExercises || 0} Exercises</span>
            </div>
          </div>
        </motion.div>

        {/* Profile Data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h3 className="text-lg font-medium text-text-primary">Your Anchors</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/5">
              <div className="flex items-center gap-3 mb-3 text-accent-teal">
                <Heart className="w-5 h-5" />
                <h4 className="font-medium">Hobbies & Interests</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.hobbies && userProfile.hobbies.length > 0 ? (
                  userProfile.hobbies.map((hobby, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-bg-secondary text-sm text-text-secondary border border-white/5">
                      {hobby}
                    </span>
                  ))
                ) : (
                  <span className="text-text-muted text-sm">None recorded yet.</span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/5">
              <div className="flex items-center gap-3 mb-3 text-accent-blue">
                <Target className="w-5 h-5" />
                <h4 className="font-medium">Financial Goals</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.financialGoals && userProfile.financialGoals.length > 0 ? (
                  userProfile.financialGoals.map((goal, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-bg-secondary text-sm text-text-secondary border border-white/5">
                      {goal}
                    </span>
                  ))
                ) : (
                  <span className="text-text-muted text-sm">None recorded yet.</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
