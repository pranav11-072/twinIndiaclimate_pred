import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Satellite, 
  HardDrive, 
  Server, 
  ArrowDown, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { NATIONAL_DATA_SOURCES } from '../data/dataSources';
import { BadgeTag } from '../components/BadgeTag';

export const DataSourcesView: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<string>('all');

  const filteredSources = NATIONAL_DATA_SOURCES.filter((s) => {
    return selectedAgency === 'all' || s.agency === selectedAgency;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                National Earth Observation & Climate Repositories
              </h2>
              <BadgeTag tag="OPERATIONAL" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Authoritative ingest interfaces connecting IMD, ISRO MOSDAC, Bhuvan, NICES, and INCOIS.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              8 Data Feeds Catalogued
            </span>
          </div>
        </div>

        {/* Agency Filter */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
          {['all', 'IMD', 'ISRO MOSDAC', 'Bhuvan', 'NICES', 'INCOIS'].map((agency) => (
            <button
              key={agency}
              onClick={() => setSelectedAgency(agency)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedAgency === agency
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {agency === 'all' ? 'All National Agencies' : agency}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Pipeline Section from Brief Section 16 */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
            National Data Ingestion & Transformation Pipeline
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Multi-stage orchestration from raw binary satellite telemetry to digital twin simulation
          </p>
        </div>

        {/* Vertical Pipeline Flow Diagram */}
        <div className="max-w-2xl mx-auto py-4 space-y-2">
          {[
            { step: '01', title: 'IMD DATA (Gridded 0.25° Rain & Temp)', desc: 'Ground rain gauge network (3,500+ stations) interpolated daily.', agency: 'IMD' },
            { step: '02', title: 'INSAT-3DR DATA (LST, SST, HEM Precipitation)', desc: 'Geostationary infrared radiances at 4 km nadir resolution.', agency: 'ISRO MOSDAC' },
            { step: '03', title: 'DATA INGESTION (Xarray & Async S3 Connectors)', desc: 'Automated retrieval from MOSDAC OpenDAP and IMD FTP archives.', agency: 'CORE PIPELINE' },
            { step: '04', title: 'PRE-PROCESSING & QUALITY CONTROL', desc: 'Bilinear regridding, cloud-masking, terrain elevation embedding.', agency: 'CORE PIPELINE' },
            { step: '05', title: 'SPATIOTEMPORAL DATA FUSION', desc: 'Harmonization onto common 0.10° Pan-India reference mesh.', agency: 'CORE PIPELINE' },
            { step: '06', title: 'AI MODEL INFERENCE (ConvLSTM)', desc: 'Physical conservation loss-guided spatio-temporal deep neural network.', agency: 'AI ENGINE' },
            { step: '07', title: 'DIGITAL TWIN 5-SPHERES STATE SYNTHESIS', desc: 'Atmosphere-Ocean-Land-Cryosphere coupled state vector update.', agency: 'DIGITAL TWIN' },
            { step: '08', title: 'WHAT-IF SIMULATION ENGINE', desc: 'User-specified temperature & rainfall climate scenario sensitivity perturbation.', agency: 'SCENARIO LAB' },
            { step: '09', title: 'INTERACTIVE DASHBOARD & ADAPTATION SUPPORT', desc: 'Scientific geospatial intelligence delivered to state disaster authorities.', agency: 'DASHBOARD' },
          ].map((item, index, arr) => (
            <React.Fragment key={item.step}>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs font-mono hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-100">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 font-sans">{item.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hidden sm:inline">
                  {item.agency}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div className="flex justify-center text-slate-600">
                  <ArrowDown className="w-4 h-4 text-cyan-400/60" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="p-5 rounded-2xl border border-slate-800 bg-[#0a0d14] flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase tracking-wider">
                    {source.agency}
                  </span>
                  <h3 className="text-base font-bold font-display text-slate-100 mt-2">
                    {source.title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">{source.parameter}</p>
                </div>
                <BadgeTag tag={source.source_type} size="sm" />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SPATIAL RESOLUTION</span>
                  <span className="text-slate-200 font-semibold">{source.spatial_resolution}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TEMPORAL CADENCE</span>
                  <span className="text-slate-200 font-semibold">{source.temporal_resolution}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">FILE FORMAT</span>
                  <span className="text-slate-200 font-semibold">{source.format}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ARCHIVE LATENCY</span>
                  <span className="text-slate-200 font-semibold">{source.latency}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed">
                {source.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs font-mono flex items-center justify-between text-slate-500">
              <span className="truncate max-w-[240px]">Coverage: {source.coverage}</span>
              <a
                href={source.api_endpoint}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0"
              >
                Catalog URL <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
