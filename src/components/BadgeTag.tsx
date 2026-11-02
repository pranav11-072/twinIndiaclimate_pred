import React from 'react';
import { DataTag } from '../types/climate';

interface BadgeTagProps {
  tag: DataTag | 'OPERATIONAL' | 'STANDBY' | 'WARNING' | 'ALERT';
  className?: string;
  size?: 'sm' | 'md';
}

export const BadgeTag: React.FC<BadgeTagProps> = ({ tag, className = '', size = 'md' }) => {
  const styles: Record<string, string> = {
    LIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    HISTORICAL: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MODELLED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    SIMULATED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    DEMO: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    OPERATIONAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    STANDBY: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    WARNING: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    ALERT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const currentStyle = styles[tag] || 'bg-slate-700/20 text-slate-300 border-slate-700/40';
  const sizeStyle = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold tracking-wider uppercase rounded border ${sizeStyle} ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {tag}
    </span>
  );
};
