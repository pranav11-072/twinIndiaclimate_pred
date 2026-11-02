import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, Layers, Info, Filter } from 'lucide-react';
import { INDIA_HISTORICAL_TIMESERIES, MONTHLY_CLIMATOLOGY } from '../data/historicalData';
import { RegionalClimateData } from '../types/climate';
import { BadgeTag } from '../components/BadgeTag';

interface HistoricalTrendsViewProps {
  regions: RegionalClimateData[];
  selectedRegion: RegionalClimateData;
  onSelectRegion: (r: RegionalClimateData) => void;
}

export const HistoricalTrendsView: React.FC<HistoricalTrendsViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [startYear, setStartYear] = useState<number>(1951);
  const [endYear, setEndYear] = useState<number>(2026);
  const [variable, setVariable] = useState<'temp_anomaly' | 'rainfall' | 'extreme_events'>('temp_anomaly');

  const filteredTimeseries = INDIA_HISTORICAL_TIMESERIES.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                Historical Climate Analysis (1951 - 2026)
              </h2>
              <BadgeTag tag="HISTORICAL" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-decadal climatological reanalysis derived from IMD 0.25° gridded observational dataset.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold">
              Baseline Period: 1971 - 2000 Normal
            </span>
          </div>
        </div>

        {/* Filter Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Subdivision / Context
            </label>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = regions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Primary Variable
            </label>
            <select
              value={variable}
              onChange={(e: any) => setVariable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="temp_anomaly">Temperature Anomaly (°C)</option>
              <option value="rainfall">Monsoon Rainfall (mm) & Anomaly (%)</option>
              <option value="extreme_events">Extreme Weather Events Frequency</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Start Epoch ({startYear})
            </label>
            <input
              type="range"
              min="1951"
              max="2010"
              step="5"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              End Epoch ({endYear})
            </label>
            <input
              type="range"
              min="1980"
              max="2026"
              step="1"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
              {variable === 'temp_anomaly' && 'Pan-India Surface Temperature Anomaly Trend (°C)'}
              {variable === 'rainfall' && 'Monsoon Season Rainfall (June-September) & Departure'}
              {variable === 'extreme_events' && 'Frequency of Extreme Precipitation Events (>150mm/24h)'}
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Epoch: {startYear} - {endYear} • Normalized against standard IMD baseline
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {variable === 'temp_anomaly' ? (
              <LineChart data={filteredTimeseries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="°C" />
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
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="temp_anomaly_c"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  name="Temp Anomaly (°C)"
                  dot={{ r: 3, fill: '#ef4444' }}
                />
              </LineChart>
            ) : variable === 'rainfall' ? (
              <AreaChart data={filteredTimeseries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit=" mm" />
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
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="rainfall_monsoon_mm"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fill="url(#rainGrad)"
                  name="Monsoon Rainfall (mm)"
                />
              </AreaChart>
            ) : (
              <BarChart data={filteredTimeseries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit=" events" />
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
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                <Bar
                  dataKey="extreme_rain_events_count"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  name="High-Intensity Rain Events / Year"
                />
                <Bar
                  dataKey="heatwave_days"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  name="Annual Heatwave Days"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Climatological Monthly Distribution Chart */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
              National Climatological Annual Cycle (Monthly Climatology)
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Mean monthly rainfall (mm) vs Maximum & Minimum Surface Temperatures (°C)
            </p>
          </div>
          <BadgeTag tag="HISTORICAL" size="sm" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_CLIMATOLOGY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit=" mm" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="°C" />
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
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="rainfall" fill="#0284c7" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
              <Bar yAxisId="right" dataKey="temp_max" fill="#ea580c" radius={[4, 4, 0, 0]} name="Max Temp (°C)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
