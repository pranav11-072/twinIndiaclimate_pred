import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  Droplets, 
  Flame, 
  Wheat, 
  Waves, 
  CheckCircle, 
  Info,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { RegionalClimateData, ScenarioResult, RiskLevel } from '../types/climate';
import { climateService } from '../services/climateService';
import { BadgeTag } from '../components/BadgeTag';

interface ScenarioSimulatorViewProps {
  regions: RegionalClimateData[];
  selectedRegion: RegionalClimateData;
  onSelectRegion: (region: RegionalClimateData) => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [tempDelta, setTempDelta] = useState<number>(2.0); // -3 to +3 °C
  const [rainDeltaPct, setRainDeltaPct] = useState<number>(-20); // -30 to +30 %
  const [co2Ppm, setCo2Ppm] = useState<number>(440);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  // Run simulation calculation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await climateService.simulateScenario({
        region_id: selectedRegion.id,
        temp_delta: tempDelta,
        rain_delta_pct: rainDeltaPct,
        co2_ppm: co2Ppm,
        monsoon_delay_days: Math.round(Math.abs(tempDelta) * 3),
      });
      setResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  // Presets from brief
  const presets = [
    { label: 'Normal Baseline', temp: 0.0, rain: 0, desc: 'Climatological normal' },
    { label: 'Heat Stress', temp: 2.5, rain: -10, desc: '+2.5°C with mild deficit' },
    { label: 'Heavy Rainfall', temp: 1.0, rain: 25, desc: 'Active monsoon surge (+25%)' },
    { label: 'Severe Drought', temp: 2.0, rain: -30, desc: '-30% monsoon precipitation' },
    { label: 'Extreme Heat', temp: 3.0, rain: -15, desc: 'Maximum thermal threshold (+3°C)' },
    { label: 'Wet Monsoon', temp: 0.5, rain: 30, desc: '+30% anomalous rainfall' },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTempDelta(preset.temp);
    setRainDeltaPct(preset.rain);
  };

  // Execute initial simulation on mount if result is null
  React.useEffect(() => {
    handleRunSimulation();
  }, [selectedRegion.id]);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Severe': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const comparisonChartData = result ? [
    {
      metric: 'Max Temp (°C)',
      Baseline: result.baseline.temp_max,
      Scenario: result.simulated.temp_max,
    },
    {
      metric: 'Min Temp (°C)',
      Baseline: result.baseline.temp_min,
      Scenario: result.simulated.temp_min,
    },
    {
      metric: 'Crop Index (%)',
      Baseline: result.baseline.crop_yield_index,
      Scenario: result.simulated.crop_yield_index,
    },
    {
      metric: 'Reservoir (%)',
      Baseline: result.baseline.water_reservoir_pct,
      Scenario: result.simulated.water_reservoir_pct,
    },
    {
      metric: 'Heat Days/Yr',
      Baseline: result.baseline.heatwave_days_per_year,
      Scenario: result.simulated.heatwave_days_per_year,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header and Disclaimers */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                Climate Scenario Lab • What-If Perturbation Engine
              </h2>
              <BadgeTag tag="SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Simulate coupled thermodynamic impacts of localized temperature warming and monsoonal precipitation shifts.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 max-w-sm">
            <strong>Mandatory Scientific Label:</strong> All results in this laboratory are numerical
            model simulations for adaptation planning, not real-world operational forecasts.
          </div>
        </div>

        {/* Region Selector Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Simulation Pilot:</span>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = regions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.zone})
                </option>
              ))}
            </select>
          </div>
          <span className="text-slate-500 hidden sm:inline">Baseline: IMD 1971-2000 Climatology</span>
        </div>
      </div>

      {/* Simulator Control Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Presets Panel (Left 5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
              Perturbation Controls
            </h3>
            <button
              onClick={() => {
                setTempDelta(0);
                setRainDeltaPct(0);
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sliders
            </button>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Temperature Anomaly (ΔT)
              </span>
              <span className="text-base font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                {tempDelta > 0 ? `+${tempDelta}` : tempDelta}°C
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.5"
              value={tempDelta}
              onChange={(e) => setTempDelta(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-3.0°C (Cooling)</span>
              <span>0.0°C (Normal)</span>
              <span>+3.0°C (Extreme Heating)</span>
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Monsoon Rainfall Departure (ΔRain)
              </span>
              <span className="text-base font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {rainDeltaPct > 0 ? `+${rainDeltaPct}` : rainDeltaPct}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={rainDeltaPct}
              onChange={(e) => setRainDeltaPct(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-30% (Severe Drought)</span>
              <span>0% (Normal)</span>
              <span>+30% (Surplus Inundation)</span>
            </div>
          </div>

          {/* Presets Grid from brief */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Scenario Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-slate-200 font-mono">{p.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {isSimulating ? 'Executing Biophysical Model...' : 'RUN SIMULATION'}
          </button>
        </div>

        {/* Results & Comparison (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result && (
            <>
              {/* Estimated Impact Matrix */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                      Scenario Results & Impact Matrix
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Estimated impacts for {result.region_name} under ΔT={tempDelta > 0 ? `+${tempDelta}` : tempDelta}°C, ΔRain={rainDeltaPct > 0 ? `+${rainDeltaPct}` : rainDeltaPct}%
                    </p>
                  </div>
                  <BadgeTag tag="MODELLED" size="sm" />
                </div>

                {/* 5 Risk Indicators from brief */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className={`p-2.5 rounded-xl border ${getRiskColor(result.risks.agri_stress)}`}>
                    <span className="text-[10px] text-slate-400 block">AGRICULTURE</span>
                    <span className="font-bold text-sm">{result.risks.agri_stress}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${getRiskColor(result.risks.water_stress)}`}>
                    <span className="text-[10px] text-slate-400 block">WATER STRESS</span>
                    <span className="font-bold text-sm">{result.risks.water_stress}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${getRiskColor(result.risks.heat_risk)}`}>
                    <span className="text-[10px] text-slate-400 block">HEAT RISK</span>
                    <span className="font-bold text-sm">{result.risks.heat_risk}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${getRiskColor(result.risks.flood_risk)}`}>
                    <span className="text-[10px] text-slate-400 block">FLOOD RISK</span>
                    <span className="font-bold text-sm">{result.risks.flood_risk}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${getRiskColor(result.risks.drought_risk)}`}>
                    <span className="text-[10px] text-slate-400 block">DROUGHT RISK</span>
                    <span className="font-bold text-sm">{result.risks.drought_risk}</span>
                  </div>
                </div>

                {/* Baseline vs Scenario Bar Comparison */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    BASELINE vs SCENARIO COMPARISON
                  </span>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Scenario" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biophysical Impact Summary Bullets */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Diagnostic Model Insights
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-sans list-disc list-inside">
                    {result.impact_summary.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Adaptation Recommendations */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Recommended Adaptation Interventions
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                    {result.adaptation_recommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
