import React from 'react';
import { 
  Thermometer, 
  CloudRain, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  Cpu, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Box,
  Bot
} from 'lucide-react';
import { RegionalClimateData, ClimateVariable } from '../types/climate';
import { ClimateMetricCard } from '../components/ClimateMetricCard';
import { ClimateMap } from '../components/ClimateMap';
import { BadgeTag } from '../components/BadgeTag';
import { EXTREME_WEATHER_ALERTS } from '../data/historicalData';

interface DashboardViewProps {
  regions: RegionalClimateData[];
  selectedRegion: RegionalClimateData;
  onSelectRegion: (region: RegionalClimateData) => void;
  activeVariable: ClimateVariable;
  onChangeVariable: (v: ClimateVariable) => void;
  onNavigate: (view: any) => void;
  onOpenAlerts: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  activeVariable,
  onChangeVariable,
  onNavigate,
  onOpenAlerts,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome / Mission Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0d1322] to-slate-900 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <BadgeTag tag="LIVE" size="sm" />
              <span className="text-xs font-mono text-cyan-400">
                MONSOON SURGE CYCLE 2026 • 0.25° HIGH-RES ENSEMBLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              AI-POWERED DIGITAL TWIN OF INDIA'S CLIMATE
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              National Climate Intelligence for Adaptation & Resilience. Integrating IMD 0.25° gridded
              surface observations with ISRO MOSDAC INSAT-3DR thermal infrared radiometric sounding and
              spatiotemporal ConvLSTM deep learning prediction models.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('observatory-3d')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Box className="w-4 h-4" />
                3D Climate Observatory (Three.js)
              </button>
              <button
                onClick={() => onNavigate('ai-copilot')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                Ask Gemini Copilot
              </button>
              <button
                onClick={() => onNavigate('political-explorer')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                SOI Political Map
              </button>
              <button
                onClick={() => onNavigate('digital-twin')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                5-Spheres Twin
              </button>
              <button
                onClick={() => onNavigate('scenario-lab')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Scenario Lab
              </button>
            </div>
          </div>

          {/* Quick Telemetry Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">AI INFERENCE</span>
              <span className="text-cyan-400 font-bold">ConvLSTM v3.2</span>
              <span className="text-[10px] text-slate-400 block">5-layer spatiotemporal</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">ASSIMILATION</span>
              <span className="text-emerald-400 font-bold">INSAT-3DR TIR</span>
              <span className="text-[10px] text-slate-400 block">30-min cadence</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SURFACE MESH</span>
              <span className="text-slate-200 font-bold">0.25° × 0.25°</span>
              <span className="text-[10px] text-slate-400 block">~25 km grid resolution</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DATA INTEGRITY</span>
              <span className="text-amber-400 font-bold">PoC DEMO FEED</span>
              <span className="text-[10px] text-slate-400 block">IMD benchmarked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Extreme Weather Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-amber-200">
              NATIONAL ADVISORY:
            </span>{' '}
            <span className="text-amber-300">
              Heavy to very heavy orographic downpours active across Assam & Western Ghats (Kerala, Coastal Karnataka).
            </span>
          </div>
        </div>
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-1 text-[11px] underline font-bold text-amber-400 hover:text-amber-200 ml-4 shrink-0"
        >
          View All ({EXTREME_WEATHER_ALERTS.length}) Advisories →
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <ClimateMetricCard
          title="Avg Temperature"
          value={selectedRegion.current.temp_current}
          unit="°C"
          anomaly={`${selectedRegion.current.temp_anomaly > 0 ? '+' : ''}${selectedRegion.current.temp_anomaly}°C`}
          anomalyType={selectedRegion.current.temp_anomaly > 1.0 ? 'positive' : 'neutral'}
          subtext={`${selectedRegion.name} subdivision`}
          icon={Thermometer}
          tag="LIVE"
          accentColor="amber"
        />

        <ClimateMetricCard
          title="Monsoon 24h Rain"
          value={selectedRegion.current.rainfall_24h}
          unit="mm"
          anomaly={`${selectedRegion.current.rainfall_anomaly_pct > 0 ? '+' : ''}${selectedRegion.current.rainfall_anomaly_pct}%`}
          anomalyType={selectedRegion.current.rainfall_anomaly_pct > 0 ? 'positive' : 'negative'}
          subtext="IMD Gridded Gauge"
          icon={CloudRain}
          tag="LIVE"
          accentColor="cyan"
        />

        <ClimateMetricCard
          title="Temp Anomaly"
          value={`+${selectedRegion.current.temp_anomaly}`}
          unit="°C"
          anomaly="vs 1971-2000"
          anomalyType="positive"
          subtext="Warming envelope"
          icon={Flame}
          tag="MODELLED"
          accentColor="rose"
        />

        <ClimateMetricCard
          title="Rainfall Anomaly"
          value={`${selectedRegion.current.rainfall_anomaly_pct > 0 ? '+' : ''}${selectedRegion.current.rainfall_anomaly_pct}`}
          unit="%"
          anomaly="Seasonal baseline"
          anomalyType="positive"
          subtext="Monsoon departure"
          icon={Activity}
          tag="MODELLED"
          accentColor="blue"
        />

        <ClimateMetricCard
          title="AI Confidence"
          value="92.4"
          unit="%"
          anomaly="ConvLSTM R²: 0.86"
          anomalyType="neutral"
          subtext="7-day horizon"
          icon={Cpu}
          tag="SIMULATED"
          accentColor="emerald"
        />

        <ClimateMetricCard
          title="Climate Risk"
          value={selectedRegion.risks.overall_risk}
          anomaly="Composite Stress"
          anomalyType={selectedRegion.risks.overall_risk === 'Severe' ? 'positive' : 'neutral'}
          subtext="Vulnerability matrix"
          icon={ShieldAlert}
          tag="DEMO"
          accentColor="purple"
        />
      </div>

      {/* Main Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Interactive India Geospatial Climate Map
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Click any meteorological subdivision polygon to inspect regional state and 7-day forecast
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Selected Pilot:</span>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = regions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Leaflet Map Component */}
        <ClimateMap
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          activeVariable={activeVariable}
          onChangeVariable={onChangeVariable}
        />
      </div>

      {/* Visual Pipeline Architecture Preview from Brief */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">
              National Climate Digital Twin Data Flow Pipeline
            </h3>
            <p className="text-xs font-mono text-slate-400">
              End-to-end spatiotemporal fusion from ISRO/IMD feeds to adaptation decision support
            </p>
          </div>
          <button
            onClick={() => onNavigate('data-sources')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Explore Data Sources <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 01</span>
            <div className="text-slate-200 font-semibold">Multi-Source Data</div>
            <div className="text-[11px] text-slate-400">IMD 0.25° Grids + INSAT-3DR LST & SST</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 02</span>
            <div className="text-slate-200 font-semibold">AI Intelligence</div>
            <div className="text-[11px] text-slate-400">Spatiotemporal ConvLSTM Deep Learning</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 bg-cyan-950/20 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 03</span>
            <div className="text-cyan-300 font-semibold">Digital Twin State</div>
            <div className="text-[11px] text-slate-300">Dynamic 5-Spheres Earth System Model</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 04</span>
            <div className="text-slate-200 font-semibold">Climate Simulation</div>
            <div className="text-[11px] text-slate-400">What-If Lab Perturbations (ΔT & ΔRain)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 05</span>
            <div className="text-slate-200 font-semibold">Decision Support</div>
            <div className="text-[11px] text-slate-400">Vulnerability Matrix & Adaptation Action</div>
          </div>
        </div>
      </div>
    </div>
  );
};
