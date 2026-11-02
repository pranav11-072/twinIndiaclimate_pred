import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Droplets, 
  Wheat, 
  Waves, 
  Filter, 
  MapPin, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { RegionalClimateData, RiskLevel } from '../types/climate';
import { BadgeTag } from '../components/BadgeTag';

interface ClimateRiskViewProps {
  regions: RegionalClimateData[];
  onSelectRegion: (r: RegionalClimateData) => void;
  onNavigateToMap: () => void;
}

export const ClimateRiskView: React.FC<ClimateRiskViewProps> = ({
  regions,
  onSelectRegion,
  onNavigateToMap,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Severe':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const filteredRegions = regions.filter((r) => {
    const matchZone = filterZone === 'all' || r.zone === filterZone;
    const matchRisk =
      filterRisk === 'all' ||
      r.risks.overall_risk === filterRisk ||
      r.risks.heat_risk === filterRisk ||
      r.risks.flood_risk === filterRisk ||
      r.risks.drought_risk === filterRisk;
    return matchZone && matchRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-slate-100">
                National Climate Vulnerability & Risk Matrix
              </h2>
              <BadgeTag tag="MODELLED" size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-hazard compound vulnerability screening indexed across all major meteorological subdivisions.
            </p>
          </div>

          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4" />
            View Layered Risk on Map
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Risk Severity:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severity Levels</option>
              <option value="Severe">Severe Risk</option>
              <option value="High">High Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Geographic Zone:</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Zones (Pan-India)</option>
              <option value="South">South Peninsular</option>
              <option value="North">North & Himalayan</option>
              <option value="West">West & Arid</option>
              <option value="East">East Indo-Gangetic</option>
              <option value="Central">Central Plains</option>
              <option value="North-East">North-East Highlands</option>
            </select>
          </div>
        </div>
      </div>

      {/* Regional Risk Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRegions.map((region) => (
          <div
            key={region.id}
            className="p-5 rounded-2xl border border-slate-800 bg-[#0a0d14] space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Region Title Bar */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Zone: {region.zone}
                  </span>
                  <h3 className="text-base font-bold font-display text-slate-100">{region.name}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {region.subdivision}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getRiskBadge(
                      region.risks.overall_risk
                    )}`}
                  >
                    {region.risks.overall_risk} OVERALL
                  </span>
                </div>
              </div>

              {/* 5-Hazard Breakdown */}
              <div className="space-y-2 pt-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Heat Stress Risk:
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getRiskBadge(
                      region.risks.heat_risk
                    )}`}
                  >
                    {region.risks.heat_risk}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-blue-400" />
                    Flood & Inundation:
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getRiskBadge(
                      region.risks.flood_risk
                    )}`}
                  >
                    {region.risks.flood_risk}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    Drought Susceptibility:
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getRiskBadge(
                      region.risks.drought_risk
                    )}`}
                  >
                    {region.risks.drought_risk}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                    Agricultural Crop Stress:
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getRiskBadge(
                      region.risks.agri_stress
                    )}`}
                  >
                    {region.risks.agri_stress}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    Water Basin Stress:
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getRiskBadge(
                      region.risks.water_stress
                    )}`}
                  >
                    {region.risks.water_stress}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Soil: {region.current.soil_moisture_pct}% moisture</span>
              <button
                onClick={() => onSelectRegion(region)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Inspect Region <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
