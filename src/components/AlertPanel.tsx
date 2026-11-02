import React from 'react';
import { X, AlertTriangle, Flame, CloudRain, Wind, Droplets, Info } from 'lucide-react';
import { EXTREME_WEATHER_ALERTS } from '../data/historicalData';
import { BadgeTag } from './BadgeTag';

interface AlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion?: (regionName: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ isOpen, onClose, onSelectRegion }) => {
  if (!isOpen) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Heavy Rainfall':
      case 'Flash Flood':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'Heatwave':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'Cyclonic Circulation':
        return <Wind className="w-4 h-4 text-indigo-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Alert':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Warning':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-[#0a0d14] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-display text-slate-100">
                Extreme Weather Advisories
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Active alerts synthesized from IMD & INSAT telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice on Simulated Data */}
        <div className="mx-4 mt-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Data Integrity Notice:</strong> Real-time alerts displayed below are simulated
            against standard IMD meteorological thresholds for platform proof-of-concept demonstration.
          </span>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {EXTREME_WEATHER_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-slate-800/80 border border-slate-700/60">
                    {getAlertIcon(alert.type)}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{alert.title}</h3>
                    <div className="text-[11px] font-mono text-cyan-400">{alert.region}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <BadgeTag tag={alert.tag} size="sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">OBSERVED / MODELLED</span>
                  <span className="text-amber-400 font-semibold">{alert.metric_value}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CLIMATOLOGICAL NORMAL</span>
                  <span className="text-slate-400">{alert.normal_value}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {alert.guidance}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                <span>{alert.timestamp}</span>
                {onSelectRegion && (
                  <button
                    onClick={() => {
                      onSelectRegion(alert.region);
                      onClose();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    View on Map →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
