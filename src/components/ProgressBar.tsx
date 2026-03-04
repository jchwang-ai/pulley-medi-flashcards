import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">학습 진도</span>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            {current} <span className="text-slate-300">/ {total}</span>
          </span>
        </div>
        <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
