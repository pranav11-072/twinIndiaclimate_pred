import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wind, 
  Droplets, 
  Waves, 
  Mountain, 
  Trees, 
  Calendar, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { DigitalTwinState } from '../types/climate';
import { climateService } from '../services/climateService';
import { BadgeTag } from '../components/BadgeTag';

export const DigitalTwinView: React.FC = () => {
  // Timeline offset: -3 to +7 (-3 days historical, 0 is now, +7 days forecast)
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSphere, setActiveSphere] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    climateService.getDigitalTwinState(timelineIndex).then((state) => {
      if (isMounted) setTwinState(state);
    });
    return () => { isMounted = false; };
  }, [timelineIndex]);

  // Autoplay through timeline
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineIndex((prev) => (prev >= 7 ? -3 : prev + 1));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timelineLabels: Record<number, string> = {
    [-3]: '72h Ago (Historical Assimilation)',
    [-2]: '48h Ago (Ground Gauge Interpolation)',
    [-1]: '24h Ago (INSAT-3DR Sounding)',
    [0]: 'T=0 Current Synoptic State (Now)',
    [1]: '+24h ConvLSTM Forecast',
    [2]: '+48h ConvLSTM Forecast',
    [3]: '+72h ConvLSTM Forecast',
    [4]: '+4 Days Medium-Range Ensemble',
    [5]: '+5 Days Medium-Range Ensemble',
    [6]: '+6 Days Thermodynamic Projection',
    [7]: '+7 Days Climatological Trajectory',
  };

  if (!twinState) return null;

  return (
    <div className="space-y-6">
      {/* Header & Concept */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
              India Climate Digital Twin: 5-Spheres Earth System
            </h2>
            <BadgeTag tag={timelineIndex === 0 ? 'LIVE' : timelineIndex < 0 ? 'HISTORICAL' : 'MODELLED'} size="sm" />
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Coupled thermodynamic representation fusing atmospheric, oceanic, hydrological, cryospheric, and biospheric subsystems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right font-mono">
            <span className="text-[10px] text-slate-500 block">SIMULATION CLOCK</span>
            <span className="text-xs font-bold text-cyan-300">{twinState.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Banner from Brief:
          SATELLITE OBSERVATIONS -> DATA FUSION -> AI CLIMATE MODEL -> DIGITAL TWIN -> PREDICTION -> SCENARIO SIMULATION */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/70">
        <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs font-mono py-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            SATELLITE OBSERVATIONS
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            DATA FUSION
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            AI CLIMATE MODEL (ConvLSTM)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold shrink-0 shadow-lg shadow-cyan-950/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            DIGITAL TWIN STATE
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            PREDICTION
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            SCENARIO SIMULATION
          </div>
        </div>
      </div>

      {/* Interactive Timeline Slider Component */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Digital Twin Timeline Controller
            </span>
            <div className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
              <span>{timelineLabels[timelineIndex]}</span>
              {timelineIndex === 0 && <span className="text-xs font-mono text-emerald-400">[REAL-TIME SYNC]</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              {isPlaying ? 'Pause' : 'Play Timeline'}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setTimelineIndex(0);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 border border-slate-800 transition-colors"
              title="Reset to Present"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset (Now)
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="-3"
            max="7"
            step="1"
            value={timelineIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setTimelineIndex(Number(e.target.value));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className={timelineIndex < 0 ? 'text-blue-400 font-bold' : ''}>← Historical (-3 Days)</span>
            <span className={timelineIndex === 0 ? 'text-cyan-300 font-bold' : ''}>● Current (T=0)</span>
            <span className={timelineIndex > 0 ? 'text-amber-400 font-bold' : ''}>Forecast (+7 Days) →</span>
          </div>
        </div>
      </div>

      {/* 5-Spheres Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Sphere 1: ATMOSPHERE */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Atmospheric Sphere
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Tropospheric dynamics & circulation</span>
              </div>
            </div>
            <BadgeTag tag={timelineIndex > 0 ? 'MODELLED' : 'LIVE'} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Precipitable Water (TCWV):</span>
              <span className="font-bold text-cyan-400">
                {twinState.spheres.atmosphere.tropospheric_moisture_tcwv} kg/m²
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Monsoon Trough:</span>
              <span className="font-semibold text-slate-200">
                {twinState.spheres.atmosphere.monsoon_trough_intensity}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Tropical Easterly Jet:</span>
              <span className="font-bold text-slate-200">
                {twinState.spheres.atmosphere.jet_stream_wind_speed} knots
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Atmospheric CO₂ Proxy:</span>
              <span className="font-bold text-amber-400">
                {twinState.spheres.atmosphere.ghg_co2_ppm} ppm
              </span>
            </div>
          </div>
        </div>

        {/* Sphere 2: OCEAN & SEAS */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Oceanic Sphere
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Arabian Sea & Bay of Bengal Heat</span>
              </div>
            </div>
            <BadgeTag tag={timelineIndex > 0 ? 'MODELLED' : 'LIVE'} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Arabian Sea SST:</span>
              <span className="font-bold text-slate-100">
                {twinState.spheres.ocean.arabian_sea_sst_c}°C
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Bay of Bengal SST:</span>
              <span className="font-bold text-cyan-300">
                {twinState.spheres.ocean.bay_of_bengal_sst_c}°C
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Indian Ocean Dipole (IOD):</span>
              <span className="font-bold text-emerald-400">
                +{twinState.spheres.ocean.iod_index} (Positive)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">ENSO Pacific Teleconnection:</span>
              <span className="font-semibold text-slate-200">
                {twinState.spheres.ocean.enso_status}
              </span>
            </div>
          </div>
        </div>

        {/* Sphere 3: HYDROSPHERE */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Hydrosphere & Basins
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Ganga, Godavari, Krishna & Cauvery</span>
              </div>
            </div>
            <BadgeTag tag={timelineIndex > 0 ? 'MODELLED' : 'LIVE'} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Soil Moisture Storage:</span>
              <span className="font-bold text-cyan-400">
                +{twinState.spheres.hydrosphere.soil_water_storage_anomaly} mm
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Major Reservoirs (CWC):</span>
              <span className="font-bold text-slate-100">
                {twinState.spheres.hydrosphere.major_basins_storage_pct}% Live Capacity
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Groundwater Depletion Stress:</span>
              <span className="font-bold text-amber-400">
                Index {twinState.spheres.hydrosphere.groundwater_stress_index}/100
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">River Inundation Risk:</span>
              <span className="font-semibold text-rose-400">Elevated (Northeast)</span>
            </div>
          </div>
        </div>

        {/* Sphere 4: CRYOSPHERE (Himalayas) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Cryospheric Sentinel
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Western & Central Himalayan Glaciers</span>
              </div>
            </div>
            <BadgeTag tag="SIMULATED" size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Total Snow Cover Area:</span>
              <span className="font-bold text-slate-100">
                {twinState.spheres.cryosphere.himalayan_snow_cover_km2.toLocaleString()} km²
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Albedo Snowpack Anomaly:</span>
              <span className="font-bold text-rose-400">
                {twinState.spheres.cryosphere.snow_cover_anomaly_pct}%
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Glacial Retreat Rate:</span>
              <span className="font-bold text-amber-400">
                {twinState.spheres.cryosphere.glacier_retreat_rate_m_yr} m/year
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">GLOF Outburst Risk:</span>
              <span className="font-semibold text-amber-400">Moderate Watch</span>
            </div>
          </div>
        </div>

        {/* Sphere 5: BIOSPHERE & CROPS */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Biosphere & Agro-Ecosystem
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Kharif harvest vegetative health</span>
              </div>
            </div>
            <BadgeTag tag={timelineIndex > 0 ? 'MODELLED' : 'LIVE'} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">MODIS / INSAT NDVI:</span>
              <span className="font-bold text-emerald-400">
                {twinState.spheres.biosphere.ndvi_greenness_index}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Kharif Crop Health Score:</span>
              <span className="font-bold text-slate-100">
                {twinState.spheres.biosphere.kharif_crop_health_pct}%
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Forest Fire Vulnerability:</span>
              <span className="font-semibold text-emerald-400">
                {twinState.spheres.biosphere.forest_fire_vulnerability}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Agro-Ecological Stress:</span>
              <span className="font-semibold text-amber-400">Heat Stress in Arid NW</span>
            </div>
          </div>
        </div>

        {/* Sphere 6: DIGITAL TWIN COUPLING STATUS */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-cyan-200">
                  Data Assimilation Engine
                </h3>
                <span className="text-[10px] font-mono text-cyan-400/80">Ensemble Kalman Filter (EnKF)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-bold">
              CONVERGED
            </span>
          </div>

          <p className="text-xs font-sans text-slate-300 leading-relaxed">
            The Digital Twin maintains continuous thermodynamic mass-balance coupling across the Indian
            landmass and adjoining seas. As new INSAT-3DR sounding radiances arrive every 30 minutes,
            the state variables dynamically re-balance.
          </p>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/20 text-[11px] font-mono space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Grid Points Assimilated:</span>
              <span className="text-cyan-400 font-bold">144,200 nodes</span>
            </div>
            <div className="flex justify-between">
              <span>Kalman Innovation Gain:</span>
              <span className="text-emerald-400 font-bold">0.084 (Optimal)</span>
            </div>
            <div className="flex justify-between">
              <span>Next Synoptic Cycle:</span>
              <span className="text-slate-400">19:00 IST (28 min)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
