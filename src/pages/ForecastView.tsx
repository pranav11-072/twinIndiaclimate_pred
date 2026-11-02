import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Sparkles, Calendar, TrendingUp, Cpu, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RegionalClimateData } from '../types/climate';
import { BadgeTag } from '../components/BadgeTag';

interface ForecastViewProps {
  regions: RegionalClimateData[];
  selectedRegion: RegionalClimateData;
  onSelectRegion: (region: RegionalClimateData) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [variable, setVariable] = useState<'rainfall' | 'temp_max' | 'temp_min'>('rainfall');
  const [horizonDays, setHorizonDays] = useState<number>(7);

  const forecastData = selectedRegion.forecast_7d.slice(0, horizonDays).map((f, i) => {
    if (variable === 'rainfall') {
      return {
        date: f.date.substring(5),
        day: f.day_name,
        predicted: f.rainfall_mm,
        upper_bound: f.upper_bound_rain,
        lower_bound: f.lower_bound_rain,
        observed: i === 0 ? selectedRegion.current.rainfall_24h : null,
        confidence: f.confidence_pct,
        condition: f.condition,
      };
    } else if (variable === 'temp_max') {
      return {
        date: f.date.substring(5),
        day: f.day_name,
        predicted: f.temp_max,
        upper_bound: f.upper_bound_temp,
        lower_bound: f.lower_bound_temp,
        observed: i === 0 ? selectedRegion.current.temp_max : null,
        confidence: f.confidence_pct,
        condition: f.condition,
      };
    } else {
      return {
        date: f.date.substring(5),
        day: f.day_name,
        predicted: f.temp_min,
        upper_bound: f.upper_bound_temp - 8,
        lower_bound: f.lower_bound_temp - 8,
        observed: i === 0 ? selectedRegion.current.temp_min : null,
        confidence: f.confidence_pct,
        condition: f.condition,
      };
    }
  });

  const getUnit = () => (variable === 'rainfall' ? 'mm' : '°C');

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1e] to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                AI Forecast Engine • Spatiotemporal ConvLSTM
              </h2>
              <BadgeTag tag="MODELLED" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deep recurrent convolutional neural network with physical thermodynamic conservation loss constraints.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
              Mean Ensemble Confidence: 89.2%
            </span>
          </div>
        </div>

        {/* Forecast Configuration Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
          {/* Region Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Target Region
            </label>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = regions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.zone})
                </option>
              ))}
            </select>
          </div>

          {/* Climate Variable Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Predictive Variable
            </label>
            <select
              value={variable}
              onChange={(e: any) => setVariable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="rainfall">Precipitation (mm/24h)</option>
              <option value="temp_max">Maximum Temperature (°C)</option>
              <option value="temp_min">Minimum Temperature (°C)</option>
            </select>
          </div>

          {/* Forecast Horizon Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    horizonDays === days
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {days} {days === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Forecast Graph */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
              ConvLSTM Multi-Horizon Trajectory with 90% Confidence Interval
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Region: {selectedRegion.name} • Horizon: {horizonDays} Days Ahead
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400" /> AI Predicted
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40" /> 90% Confidence Band
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Observed (T=0)
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit={` ${getUnit()}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              {/* Upper and Lower Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="#0284c7"
                strokeDasharray="4 4"
                fill="url(#confidenceBand)"
                name={`Upper Bound (${getUnit()})`}
              />
              <Area
                type="monotone"
                dataKey="lower_bound"
                stroke="#0284c7"
                strokeDasharray="4 4"
                fill="transparent"
                name={`Lower Bound (${getUnit()})`}
              />
              {/* Predicted Line */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#38bdf8"
                strokeWidth={3}
                fill="transparent"
                name={`AI Predicted (${getUnit()})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {selectedRegion.forecast_7d.slice(0, horizonDays).map((day, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200 font-bold">{day.day_name}</span>
              <span className="text-[10px] text-cyan-400 font-semibold">{day.confidence_pct}% conf</span>
            </div>

            <div className="text-[11px] text-slate-400 font-sans truncate" title={day.condition}>
              {day.condition}
            </div>

            <div className="pt-2 border-t border-slate-800/80 font-mono space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tmax:</span>
                <span className="text-slate-100 font-bold">{day.temp_max}°C</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Rain:</span>
                <span className="text-cyan-400 font-bold">{day.rainfall_mm} mm</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Diagnostics Info Box */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Model Governance:</strong> ConvLSTM weights initialized from 1980-2020 ERA5 & IMD reanalysis,
            fine-tuned on 2021-2025 daily satellite data. Inference execution: 18ms.
          </span>
        </div>
        <BadgeTag tag="SIMULATED" size="sm" />
      </div>
    </div>
  );
};
