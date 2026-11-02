import React, { useState } from 'react';
import { 
  Terminal, 
  Server, 
  Database, 
  Layers, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';
import { climateService } from '../services/climateService';
import { BadgeTag } from '../components/BadgeTag';

export const SystemView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/climate/current?region=karnataka');
  const [responseJson, setResponseJson] = useState<string>('Select an endpoint and click "Execute Live Request" to inspect the JSON schema.');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const endpoints = [
    { label: 'GET /api/climate/current?region=karnataka', method: 'GET', path: '/api/climate/current?region=karnataka' },
    { label: 'GET /api/climate/forecast?region=karnataka&days=7', method: 'GET', path: '/api/climate/forecast?region=karnataka&days=7' },
    { label: 'GET /api/digital-twin/state?timeline_offset=0', method: 'GET', path: '/api/digital-twin/state?timeline_offset=0' },
    { label: 'POST /api/scenario/simulate (ΔT=+2°C, ΔRain=-20%)', method: 'POST', path: '/api/scenario/simulate' },
    { label: 'GET /api/climate/historical?startYear=1990', method: 'GET', path: '/api/climate/historical?startYear=1990' },
    { label: 'GET /api/model/performance', method: 'GET', path: '/api/model/performance' },
    { label: 'GET /api/data/sources', method: 'GET', path: '/api/data/sources' },
    { label: 'GET /api/climate/regions', method: 'GET', path: '/api/climate/regions' },
  ];

  const handleExecute = async () => {
    setLoading(true);
    try {
      let res: any;
      if (selectedEndpoint.includes('/api/climate/current')) {
        res = await climateService.getCurrent('karnataka');
      } else if (selectedEndpoint.includes('/api/climate/forecast')) {
        res = await climateService.getForecast('karnataka', 7);
      } else if (selectedEndpoint.includes('/api/digital-twin/state')) {
        res = await climateService.getDigitalTwinState(0);
      } else if (selectedEndpoint.includes('/api/scenario/simulate')) {
        res = await climateService.simulateScenario({
          region_id: 'karnataka',
          temp_delta: 2.0,
          rain_delta_pct: -20,
          co2_ppm: 429.8,
          monsoon_delay_days: 7,
        });
      } else if (selectedEndpoint.includes('/api/climate/historical')) {
        res = await climateService.getHistorical(1990, 2026);
      } else if (selectedEndpoint.includes('/api/model/performance')) {
        res = await climateService.getModelPerformance();
      } else if (selectedEndpoint.includes('/api/data/sources')) {
        res = await climateService.getDataSources();
      } else {
        res = await climateService.getRegions();
      }
      setResponseJson(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setResponseJson(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                System Architecture & REST API Playground
              </h2>
              <BadgeTag tag="OPERATIONAL" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Microservices specification, FastAPI endpoints, Pydantic data schemas, and deployment topology.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              FastAPI Spec: 3.1.0 • Docker Ready
            </span>
          </div>
        </div>
      </div>

      {/* Backend Architectural Hierarchy from Brief Section 19 */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
            System Component Architecture Diagram
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Decoupled service layer allowing AI models to be upgraded without frontend rewrites
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
          <pre>{`Frontend (React + Vite + Leaflet + Tailwind CSS)
   │
   ▼
FastAPI Gateway & Pydantic Validation (/api/*)
   │
   ├── Climate Service       ──> In-memory cache & IMD 0.25° gridded query engine
   ├── Forecast Service      ──> ConvLSTM PyTorch Inference microservice
   ├── Scenario Service      ──> Biophysical perturbation & sensitivity evaluator
   ├── Digital Twin Service  ──> 5-Spheres coupled Earth state synthesizer
   ├── Risk Service          ──> Multi-hazard compound vulnerability screening
   └── Data Service          ──> S3 / OpenDAP raster ingestion connectors
          │
          ▼
     PostgreSQL + PostGIS (Spatial indexing & subdivision boundaries)
          │
          ▼
 External National Archives (IMD / INSAT MOSDAC / Bhuvan / NICES / INCOIS)`}</pre>
        </div>
      </div>

      {/* Interactive REST API Explorer */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
              Interactive Endpoint Inspector
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Test and inspect live JSON responses generated by the platform service layer
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Response'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Choose Endpoint
            </label>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {endpoints.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEndpoint(ep.path)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                    selectedEndpoint === ep.path
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{ep.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                      ep.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {loading ? 'Executing Service...' : 'Execute Live Request'}
            </button>
          </div>

          <div className="md:col-span-7 flex flex-col space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              JSON Output
            </span>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-auto max-h-[380px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{responseJson}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Layout from Brief Section 28 */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-3">
        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
          Repository Folder Architecture Specification
        </h3>
        <p className="text-xs font-mono text-slate-400">
          Scalable layout designed for multi-institution ISRO / IMD academic deployment
        </p>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-400 border border-slate-800/80 overflow-x-auto">
          <pre>{`india-climate-digital-twin/
├── frontend/ (React 19, TypeScript, Vite, Tailwind CSS, Leaflet, Recharts)
│   ├── src/components/ (Header, Sidebar, ClimateMap, ClimateMetricCard, AlertPanel)
│   ├── src/pages/ (DashboardView, DigitalTwinView, ForecastView, ScenarioLab, ClimateRisk)
│   └── src/services/ (climateService.ts REST client)
├── backend/ (Python 3.11+, FastAPI, Pydantic, Xarray, GeoPandas)
│   ├── app/api/ (climate.py, forecast.py, scenario.py, digital_twin.py)
│   ├── app/ml/ (convlstm_model.py, spatial_encoder.py, regridding.py)
│   └── app/models/ (climate_schemas.py, pydantic_v2.py)
├── ml/training/ (ConvLSTM multi-GPU PyTorch training loop on ERA5 & IMD)
├── data/sample/ (Sample 0.25° NetCDF slices & GeoJSON subdivisions)
└── docker-compose.yml (FastAPI + PostgreSQL 16 PostGIS + Redis cache)`}</pre>
        </div>
      </div>
    </div>
  );
};
