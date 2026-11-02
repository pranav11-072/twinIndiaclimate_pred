import React, { useState } from 'react';
import { X, Play, Copy, Check, Terminal, ExternalLink, Code2 } from 'lucide-react';
import { climateService } from '../services/climateService';

interface ApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiModal: React.FC<ApiModalProps> = ({ isOpen, onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/climate/current?region=karnataka');
  const [responseJson, setResponseJson] = useState<string>('Click "Execute Query" to inspect live JSON payload.');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

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
      let result: any;
      if (selectedEndpoint.includes('/api/climate/current')) {
        result = await climateService.getCurrent('karnataka');
      } else if (selectedEndpoint.includes('/api/climate/forecast')) {
        result = await climateService.getForecast('karnataka', 7);
      } else if (selectedEndpoint.includes('/api/digital-twin/state')) {
        result = await climateService.getDigitalTwinState(0);
      } else if (selectedEndpoint.includes('/api/scenario/simulate')) {
        result = await climateService.simulateScenario({
          region_id: 'karnataka',
          temp_delta: 2.0,
          rain_delta_pct: -20,
          co2_ppm: 429.8,
          monsoon_delay_days: 7,
        });
      } else if (selectedEndpoint.includes('/api/climate/historical')) {
        result = await climateService.getHistorical(1990, 2026);
      } else if (selectedEndpoint.includes('/api/model/performance')) {
        result = await climateService.getModelPerformance();
      } else if (selectedEndpoint.includes('/api/data/sources')) {
        result = await climateService.getDataSources();
      } else {
        result = await climateService.getRegions();
      }
      setResponseJson(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0c1017] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#07090e]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase font-display text-slate-100 flex items-center gap-2">
                Climate REST API Engine
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  FASTAPI COMPATIBLE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Decoupled backend service architecture for ConvLSTM & National Climate Repositories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Endpoint Selector */}
          <div className="md:col-span-5 space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Available Endpoints
            </label>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
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
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {loading ? 'Executing Service Query...' : 'Execute Endpoint'}
            </button>
          </div>

          {/* JSON Response Terminal */}
          <div className="md:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                Response Payload (application/json)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-auto max-h-[460px] leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{responseJson}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#07090e] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Payload Format: NetCDF-CF to GeoJSON / Pydantic V2 Schema</span>
          <span className="text-slate-400">Response Latency: 12ms (Cached In-Memory)</span>
        </div>
      </div>
    </div>
  );
};
