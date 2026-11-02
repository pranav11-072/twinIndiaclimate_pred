import React from 'react';
import { LucideIcon } from 'lucide-react';
import { BadgeTag } from './BadgeTag';
import { DataTag } from '../types/climate';

interface ClimateMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  anomaly?: string;
  anomalyType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon: LucideIcon;
  tag?: DataTag;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const ClimateMetricCard: React.FC<ClimateMetricCardProps> = ({
  title,
  value,
  unit,
  anomaly,
  anomalyType = 'neutral',
  subtext,
  icon: Icon,
  tag = 'MODELLED',
  accentColor = 'cyan',
}) => {
  const accentBorderMap = {
    cyan: 'hover:border-cyan-500/50 group-hover:text-cyan-400',
    blue: 'hover:border-blue-500/50 group-hover:text-blue-400',
    emerald: 'hover:border-emerald-500/50 group-hover:text-emerald-400',
    amber: 'hover:border-amber-500/50 group-hover:text-amber-400',
    rose: 'hover:border-rose-500/50 group-hover:text-rose-400',
    purple: 'hover:border-purple-500/50 group-hover:text-purple-400',
  };

  const anomalyBg =
    anomalyType === 'positive'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : anomalyType === 'negative'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : 'bg-slate-700/20 text-slate-400 border-slate-700/30';

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/90 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20 ${accentBorderMap[accentColor]}`}
    >
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          {title}
        </span>
        {tag && <BadgeTag tag={tag} size="sm" />}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-100">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400 font-mono">{unit}</span>}
      </div>

      {/* Anomaly & Subtext Footer */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
        {anomaly ? (
          <span
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded border ${anomalyBg} font-medium flex items-center gap-1`}
          >
            {anomaly}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">Nominal index</span>
        )}
        {subtext && (
          <span className="text-[11px] text-slate-400 truncate max-w-[55%] text-right font-sans">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
