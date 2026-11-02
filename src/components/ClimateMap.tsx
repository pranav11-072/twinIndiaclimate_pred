import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ClimateVariable, RegionalClimateData } from '../types/climate';
import { BadgeTag } from './BadgeTag';
import { 
  CloudRain, 
  Thermometer, 
  Flame, 
  Waves, 
  Activity, 
  ShieldAlert, 
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  Info
} from 'lucide-react';

interface ClimateMapProps {
  regions: RegionalClimateData[];
  selectedRegion: RegionalClimateData;
  onSelectRegion: (region: RegionalClimateData) => void;
  activeVariable: ClimateVariable;
  onChangeVariable: (variable: ClimateVariable) => void;
}

export const ClimateMap: React.FC<ClimateMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  activeVariable,
  onChangeVariable,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  // Variable color computation
  const getRegionColor = (r: RegionalClimateData, variable: ClimateVariable): string => {
    switch (variable) {
      case 'rainfall': {
        const rf = r.current.rainfall_24h;
        if (rf > 100) return '#0284c7'; // intense blue
        if (rf > 60) return '#0ea5e9'; // bright sky
        if (rf > 30) return '#38bdf8'; // medium sky
        if (rf > 10) return '#7dd3fc'; // light blue
        return '#bae6fd'; // very light
      }
      case 'temp_max': {
        const t = r.current.temp_max;
        if (t > 40) return '#b91c1c'; // deep red
        if (t > 36) return '#ea580c'; // intense orange
        if (t > 32) return '#f59e0b'; // amber
        if (t > 28) return '#eab308'; // yellow
        return '#10b981'; // moderate green/mild
      }
      case 'temp_min': {
        const t = r.current.temp_min;
        if (t > 25) return '#f97316';
        if (t > 20) return '#38bdf8';
        if (t > 15) return '#0284c7';
        return '#6366f1';
      }
      case 'lst': {
        const lst = r.current.lst;
        if (lst > 42) return '#991b1b';
        if (lst > 35) return '#dc2626';
        if (lst > 30) return '#f97316';
        return '#14b8a6';
      }
      case 'sst': {
        const sst = r.current.sst || 28.0;
        if (sst > 29.5) return '#dc2626';
        if (sst > 29.0) return '#ea580c';
        if (sst > 28.0) return '#0284c7';
        return '#0369a1';
      }
      case 'temp_anomaly': {
        const anom = r.current.temp_anomaly;
        if (anom > 2.5) return '#dc2626';
        if (anom > 1.0) return '#f97316';
        if (anom > 0) return '#eab308';
        return '#3b82f6';
      }
      case 'rainfall_anomaly': {
        const anom = r.current.rainfall_anomaly_pct;
        if (anom > 25) return '#0284c7'; // large positive
        if (anom > 0) return '#38bdf8';
        if (anom > -25) return '#f59e0b';
        return '#ef4444'; // large deficit
      }
      case 'drought_risk': {
        const risk = r.risks.drought_risk;
        if (risk === 'Severe') return '#b91c1c';
        if (risk === 'High') return '#ea580c';
        if (risk === 'Moderate') return '#eab308';
        return '#10b981';
      }
      case 'extreme_rainfall_risk': {
        const risk = r.risks.flood_risk;
        if (risk === 'Severe') return '#4338ca';
        if (risk === 'High') return '#0284c7';
        if (risk === 'Moderate') return '#06b6d4';
        return '#10b981';
      }
      default:
        return '#0284c7';
    }
  };

  const getMetricDisplay = (r: RegionalClimateData, variable: ClimateVariable) => {
    switch (variable) {
      case 'rainfall': return `${r.current.rainfall_24h} mm`;
      case 'temp_max': return `${r.current.temp_max}°C`;
      case 'temp_min': return `${r.current.temp_min}°C`;
      case 'lst': return `${r.current.lst}°C`;
      case 'sst': return r.current.sst ? `${r.current.sst}°C` : 'Inland (N/A)';
      case 'temp_anomaly': return `${r.current.temp_anomaly > 0 ? '+' : ''}${r.current.temp_anomaly}°C`;
      case 'rainfall_anomaly': return `${r.current.rainfall_anomaly_pct > 0 ? '+' : ''}${r.current.rainfall_anomaly_pct}%`;
      case 'drought_risk': return r.risks.drought_risk;
      case 'extreme_rainfall_risk': return r.risks.flood_risk;
      default: return '';
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.0, 79.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 10,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Dark Matter CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB & OpenStreetMap | IMD-ISRO Geospatial Mesh',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, []);

  // Update GeoJSON / Polygon Polylines & Markers when variable or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    regions.forEach((region) => {
      const isSelected = region.id === selectedRegion.id;
      const color = getRegionColor(region, activeVariable);

      // Draw Polygon representation of subdivision
      const polygon = L.polygon(region.coordinates_boundary, {
        color: isSelected ? '#38bdf8' : color,
        weight: isSelected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: isSelected ? 0.65 : 0.4,
        dashArray: isSelected ? '' : '3',
      });

      // Hover and Click events
      polygon.on('mouseover', () => {
        polygon.setStyle({
          weight: 2.5,
          fillOpacity: 0.7,
        });
      });

      polygon.on('mouseout', () => {
        if (region.id !== selectedRegion.id) {
          polygon.setStyle({
            weight: 1.5,
            fillOpacity: 0.4,
          });
        }
      });

      polygon.on('click', () => {
        onSelectRegion(region);
      });

      // Custom pulsing center marker
      const markerHtml = `
        <div class="flex items-center justify-center">
          <div class="relative flex items-center justify-center">
            <span class="absolute w-6 h-6 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping opacity-75' : 'bg-transparent'}"></span>
            <div class="px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold whitespace-nowrap shadow-lg ${
              isSelected
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
            }">
              ${region.name.split(' ')[0]} : ${getMetricDisplay(region, activeVariable)}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-climate-pin',
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const marker = L.marker([region.lat, region.lng], { icon: customIcon });
      marker.on('click', () => {
        onSelectRegion(region);
      });

      layerGroupRef.current?.addLayer(polygon);
      layerGroupRef.current?.addLayer(marker);
    });
  }, [regions, selectedRegion, activeVariable]);

  // Variables list
  const variableOptions: { id: ClimateVariable; label: string; icon: any }[] = [
    { id: 'rainfall', label: 'Rainfall (24h)', icon: CloudRain },
    { id: 'temp_max', label: 'Max Temperature', icon: Thermometer },
    { id: 'temp_min', label: 'Min Temperature', icon: Thermometer },
    { id: 'lst', label: 'INSAT Land Surface (LST)', icon: Flame },
    { id: 'sst', label: 'INSAT Sea Surface (SST)', icon: Waves },
    { id: 'temp_anomaly', label: 'Temp Anomaly', icon: Activity },
    { id: 'rainfall_anomaly', label: 'Rainfall Anomaly', icon: Activity },
    { id: 'drought_risk', label: 'Drought Risk Index', icon: ShieldAlert },
    { id: 'extreme_rainfall_risk', label: 'Extreme Rain Risk', icon: CloudRain },
  ];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-[#07090e] shadow-2xl flex flex-col md:flex-row">
      {/* Map Interactive Canvas */}
      <div className="relative flex-1 h-full min-h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Variable Selector Toolbar */}
        <div className="absolute top-4 left-4 z-[400] max-w-[320px] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Climate Layer Switcher
            </span>
            <BadgeTag tag="LIVE" size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
            {variableOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeVariable === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeVariable(opt.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-mono transition-all text-left ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Projection: WGS84 / EPSG:4326</span>
            <span className="text-cyan-400">Mesh 0.25°</span>
          </div>
        </div>

        {/* Floating Legend */}
        {legendOpen && (
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl max-w-xs text-[11px] font-mono">
            <div className="flex items-center justify-between mb-1.5 text-slate-300 font-semibold">
              <span>{activeVariable.toUpperCase().replace('_', ' ')} SCALE</span>
              <button
                onClick={() => setLegendOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-1 h-3 rounded overflow-hidden mb-1">
              <div className="h-full flex-1 bg-[#10b981]" />
              <div className="h-full flex-1 bg-[#38bdf8]" />
              <div className="h-full flex-1 bg-[#0284c7]" />
              <div className="h-full flex-1 bg-[#f59e0b]" />
              <div className="h-full flex-1 bg-[#dc2626]" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Low / Deficit</span>
              <span>Nominal</span>
              <span>Severe / Peak</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Region Telemetry Drawer / Sidebar */}
      <div className="w-full md:w-80 h-auto md:h-full bg-[#0a0d14] border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header of selected region */}
          <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Selected Climate Subdivision
              </span>
              <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-1.5">
                {selectedRegion.name}
              </h3>
              <p className="text-[11px] text-slate-400">{selectedRegion.subdivision}</p>
            </div>
            <BadgeTag tag={selectedRegion.risks.overall_risk === 'Severe' ? 'ALERT' : 'MODELLED'} size="sm" />
          </div>

          {/* Regional Real-time Observations */}
          <div className="space-y-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Current Synoptic State
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TEMPERATURE</span>
                <span className="text-base font-bold text-slate-100">
                  {selectedRegion.current.temp_current}°C
                </span>
                <span className="text-[10px] text-rose-400 block">
                  {selectedRegion.current.temp_anomaly > 0 ? '+' : ''}{selectedRegion.current.temp_anomaly}°C anom
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">24H RAINFALL</span>
                <span className="text-base font-bold text-cyan-400">
                  {selectedRegion.current.rainfall_24h} mm
                </span>
                <span className="text-[10px] text-cyan-300 block">
                  {selectedRegion.current.rainfall_anomaly_pct > 0 ? '+' : ''}{selectedRegion.current.rainfall_anomaly_pct}% anom
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">INSAT LST</span>
                <span className="text-sm font-semibold text-amber-300">
                  {selectedRegion.current.lst}°C
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SOIL MOISTURE</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {selectedRegion.current.soil_moisture_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Risk Indicators for Region */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold border-b border-slate-800 pb-1">
              <span>RISK VULNERABILITY</span>
              <span className="text-cyan-400">{selectedRegion.risks.overall_risk}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heat Stress:</span>
              <span className={selectedRegion.risks.heat_risk === 'Severe' ? 'text-rose-400' : 'text-slate-200'}>
                {selectedRegion.risks.heat_risk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flood Inundation:</span>
              <span className={selectedRegion.risks.flood_risk === 'Severe' ? 'text-blue-400' : 'text-slate-200'}>
                {selectedRegion.risks.flood_risk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Drought Vulnerability:</span>
              <span className={selectedRegion.risks.drought_risk === 'Severe' ? 'text-amber-400' : 'text-slate-200'}>
                {selectedRegion.risks.drought_risk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Water Basin Stress:</span>
              <span className="text-slate-200">{selectedRegion.risks.water_stress}</span>
            </div>
          </div>

          {/* 7-Day Forecast Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-semibold text-slate-300">7-Day ConvLSTM Forecast</span>
              <span className="text-cyan-400">Conf: 91%</span>
            </div>

            <div className="space-y-1">
              {selectedRegion.forecast_7d.slice(0, 3).map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono"
                >
                  <span className="text-slate-300 font-medium w-12">{f.day_name}</span>
                  <span className="text-slate-400">{f.condition}</span>
                  <span className="text-slate-100 font-bold">{f.temp_max}° / {f.temp_min}°</span>
                  <span className="text-cyan-400 font-bold">{f.rainfall_mm} mm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region coordinates metadata */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
          <span>Lat: {selectedRegion.lat.toFixed(2)}°N | Lng: {selectedRegion.lng.toFixed(2)}°E</span>
          <span>Area: {selectedRegion.area_sqkm.toLocaleString()} km²</span>
        </div>
      </div>
    </div>
  );
};
