import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-emerald-900 flex items-center justify-center overflow-hidden"
    >
      {/* Background Pulse */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute size-[800px] border border-emerald-500/20 rounded-full"
      />

      <div className="relative flex flex-col items-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
           animate={{ scale: 1, opacity: 1, rotate: 0 }}
           transition={{ duration: 0.8, ease: "backOut" }}
           className="size-24 rounded-3xl bg-white flex items-center justify-center text-emerald-700 shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-12"
        >
          <Sparkles size={48} />
        </motion.div>

        <div className="overflow-hidden h-20 mb-4">
          <motion.h1 
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl font-black tracking-tighter text-white italic uppercase"
          >
            Clinical Flow
          </motion.h1>
        </div>

        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="h-1.5 bg-emerald-400 rounded-full mb-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 text-emerald-200/50"
        >
          <Activity size={16} />
          <span className="text-xs font-black uppercase tracking-[0.4em] ml-2">Initializing Clinical Suite</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
