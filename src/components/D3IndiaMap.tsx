import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { INDIA_GEOJSON } from '../data/indiaGeoData';
import { INDIA_STATES_METADATA, SURROUNDING_ENTITIES, StateMetadata } from '../data/indiaStatesMetadata';

export type MapViewMode = 'political' | 'thermal' | 'risk';
export type ThemeMode = 'cyber' | 'atlas';

interface D3IndiaMapProps {
  selectedState: StateMetadata | null;
  onSelectState: (state: StateMetadata) => void;
  viewMode: MapViewMode;
  theme: ThemeMode;
  showCapitals: boolean;
  showCities: boolean;
  showNeighbors: boolean;
  showBoundaries: boolean;
  onResetZoom?: () => void;
}

export const D3IndiaMap: React.FC<D3IndiaMapProps> = ({
  selectedState,
  onSelectState,
  viewMode,
  theme,
  showCapitals,
  showCities,
  showNeighbors,
  showBoundaries,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 850, height: 950 });
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Zoom behavior reference
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Track container dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 850,
          height: clientHeight || 950,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute D3 projection tailored to India coordinates
  const { projection, pathGenerator } = useMemo(() => {
    // Project with Mercator, fitted tightly to India's complete official bounds
    const proj = d3
      .geoMercator()
      .fitSize([dimensions.width, dimensions.height], INDIA_GEOJSON as any);

    const path = d3.geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [dimensions]);

  // Color functions based on mode
  const getFeatureFill = (featureName: string, isSelected: boolean) => {
    const meta = INDIA_STATES_METADATA[featureName];

    if (viewMode === 'political') {
      if (theme === 'cyber') {
        if (isSelected) return '#06b6d4'; // bright glowing cyan
        // Palette of cohesive dark cyber tones
        const cyberTones: Record<string, string> = {
          North: '#0f293a',
          South: '#0f313a',
          East: '#13283f',
          West: '#1a273b',
          Central: '#153245',
          'North-East': '#0d3238',
          Islands: '#0b2b34',
        };
        return meta ? cyberTones[meta.zone] || '#111e2f' : '#111e2f';
      } else {
        // Atlas Light mode
        if (isSelected) return '#0284c7';
        const atlasPastels: Record<string, string> = {
          North: '#e0f2fe',
          South: '#fef3c7',
          East: '#f1f5f9',
          West: '#ffedd5',
          Central: '#dcfce7',
          'North-East': '#fce7f3',
          Islands: '#cffafe',
        };
        return meta ? atlasPastels[meta.zone] || '#f8fafc' : '#f8fafc';
      }
    } else if (viewMode === 'thermal') {
      // Temperature / LST Heatmap scale
      const temp = meta ? meta.temperature : 28;
      // 8°C (Ladakh) to 37°C (Rajasthan)
      const tNorm = Math.min(1, Math.max(0, (temp - 8) / 30));
      return d3.interpolateTurbo(tNorm);
    } else {
      // Risk Radar
      const risk = meta ? meta.riskLevel : 'LOW';
      if (risk === 'SEVERE') return theme === 'cyber' ? '#dc2626' : '#ef4444';
      if (risk === 'HIGH') return theme === 'cyber' ? '#ea580c' : '#f97316';
      if (risk === 'MODERATE') return theme === 'cyber' ? '#d97706' : '#f59e0b';
      return theme === 'cyber' ? '#059669' : '#10b981';
    }
  };

  // Zoom setup
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 12])
      .on('zoom', (event) => {
        if (gRef.current) {
          d3.select(gRef.current).attr('transform', event.transform.toString());
        }
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial neutral zoom
    svg.call(zoom.transform, d3.zoomIdentity);
  }, []);

  // Zoom to state when selected
  useEffect(() => {
    if (!selectedState || !svgRef.current || !zoomBehaviorRef.current) return;

    const feature = (INDIA_GEOJSON as any).features.find(
      (f: any) =>
        f.properties.st_nm?.toLowerCase() === selectedState.name.toLowerCase() ||
        f.properties.st_nm?.toLowerCase() === selectedState.id.toLowerCase()
    );

    if (feature && pathGenerator) {
      const bounds = pathGenerator.bounds(feature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;
      const scale = Math.max(1, Math.min(6, 0.75 / Math.max(dx / dimensions.width, dy / dimensions.height)));
      const translate: [number, number] = [
        dimensions.width / 2 - scale * x,
        dimensions.height / 2 - scale * y,
      ];

      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(
          zoomBehaviorRef.current.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }
  }, [selectedState, pathGenerator, dimensions]);

  // Handle Full Reset Zoom
  const handleReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(700)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const isDark = theme === 'cyber';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden transition-colors duration-300 select-none ${
        isDark
          ? 'bg-[#06080e] text-slate-100'
          : 'bg-[#f1f5f9] text-slate-800'
      }`}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(#0891b2 1px, transparent 1px), linear-gradient(to right, #0e1e2d 1px, transparent 1px), linear-gradient(to bottom, #0e1e2d 1px, transparent 1px)'
            : 'radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main SVG D3 Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          {/* Cyber State Glow Filter */}
          <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Capital Pin Marker Filter */}
          <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" />
          </filter>
        </defs>

        {/* Dynamic Zooming Group Container */}
        <g ref={gRef}>
          {/* Surrounding Seas & Ocean Labels */}
          {showNeighbors &&
            SURROUNDING_ENTITIES.filter((e) => e.type !== 'country').map((sea) => {
              const coords = projection([sea.lng, sea.lat]);
              if (!coords) return null;
              return (
                <g key={sea.name} transform={`translate(${coords[0]}, ${coords[1]})`}>
                  <text
                    textAnchor="middle"
                    className={`font-mono font-bold tracking-[0.25em] text-[11px] ${
                      isDark ? 'fill-cyan-500/40' : 'fill-sky-700/50'
                    }`}
                  >
                    ≈ {sea.name} ≈
                  </text>
                </g>
              );
            })}

          {/* Surrounding Neighboring Sovereign Nations */}
          {showNeighbors &&
            SURROUNDING_ENTITIES.filter((e) => e.type === 'country').map((nation) => {
              const coords = projection([nation.lng, nation.lat]);
              if (!coords) return null;
              return (
                <g key={nation.name} transform={`translate(${coords[0]}, ${coords[1]})`}>
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="18"
                    rx="3"
                    className={`${
                      isDark
                        ? 'fill-slate-900/60 stroke-slate-800'
                        : 'fill-white/80 stroke-slate-300'
                    }`}
                  />
                  <text
                    textAnchor="middle"
                    y="2"
                    className={`font-mono text-[9px] font-bold tracking-wider ${
                      isDark ? 'fill-slate-400' : 'fill-slate-600'
                    }`}
                  >
                    {nation.name}
                  </text>
                </g>
              );
            })}

          {/* Real State & UT GeoJSON Polygons */}
          <g className="states-polygons">
            {(INDIA_GEOJSON as any).features.map((feature: any, index: number) => {
              const stateName = feature.properties.st_nm;
              const isSelected = selectedState?.name === stateName || selectedState?.id === stateName;
              const isHovered = hoveredFeature?.properties.st_nm === stateName;
              const d = pathGenerator(feature);
              if (!d) return null;

              const fillColor = getFeatureFill(stateName, isSelected);

              return (
                <path
                  key={`${stateName}-${index}`}
                  d={d}
                  fill={fillColor}
                  stroke={
                    isSelected
                      ? isDark
                        ? '#38bdf8'
                        : '#0284c7'
                      : isHovered
                      ? isDark
                        ? '#22d3ee'
                        : '#0369a1'
                      : isDark
                      ? '#1e293b'
                      : '#94a3b8'
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-colors duration-150 cursor-pointer"
                  style={{
                    filter: isSelected && isDark ? 'url(#cyberGlow)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    setHoveredFeature(feature);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoveredFeature(null);
                    setTooltipPos(null);
                  }}
                  onClick={() => {
                    const meta = INDIA_STATES_METADATA[stateName];
                    if (meta) onSelectState(meta);
                  }}
                />
              );
            })}
          </g>

          {/* Special Demarcated Boundary / Line of Control styling indicator */}
          {showBoundaries && (
            <g className="demarcated-frontiers pointer-events-none opacity-80">
              {/* Northern Frontiers Line overlay */}
              <circle
                cx={projection([76.8, 35.5])?.[0] || 0}
                cy={projection([76.8, 35.5])?.[1] || 0}
                r="6"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={(projection([76.8, 35.5])?.[0] || 0) + 10}
                y={(projection([76.8, 35.5])?.[1] || 0) + 3}
                className="text-[8px] font-mono fill-rose-400 font-bold tracking-wider"
              >
                SIACHEN / NORTHERN DEMARCATION
              </text>
            </g>
          )}

          {/* State Capitals (Circle with center point) */}
          {showCapitals && (
            <g className="capitals-layer pointer-events-none">
              {Object.values(INDIA_STATES_METADATA).map((state) => {
                const coords = projection(state.capitalCoords);
                if (!coords) return null;
                const isSelected = selectedState?.id === state.id;

                return (
                  <g key={`capital-${state.id}`} transform={`translate(${coords[0]}, ${coords[1]})`}>
                    <circle
                      r={isSelected ? 5 : 3.5}
                      className={
                        isSelected
                          ? isDark
                            ? 'fill-cyan-400 stroke-white'
                            : 'fill-sky-600 stroke-white'
                          : isDark
                          ? 'fill-amber-400 stroke-slate-900'
                          : 'fill-red-600 stroke-white'
                      }
                      strokeWidth="1.2"
                    />
                    <circle
                      r={1.2}
                      className={isDark ? 'fill-slate-950' : 'fill-white'}
                    />
                    <text
                      x="6"
                      y="3"
                      className={`font-mono text-[9px] font-bold ${
                        isSelected
                          ? isDark
                            ? 'fill-cyan-300 font-extrabold'
                            : 'fill-sky-800 font-extrabold'
                          : isDark
                          ? 'fill-slate-200'
                          : 'fill-slate-700'
                      }`}
                    >
                      {state.capital.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Major Cities (Filled Dot) */}
          {showCities && (
            <g className="cities-layer pointer-events-none">
              {Object.values(INDIA_STATES_METADATA)
                .flatMap((s) => s.majorCities.filter((c) => !c.isCapital))
                .map((city, idx) => {
                  const coords = projection([city.lng, city.lat]);
                  if (!coords) return null;
                  return (
                    <g key={`city-${city.name}-${idx}`} transform={`translate(${coords[0]}, ${coords[1]})`}>
                      <circle
                        r="2.2"
                        className={isDark ? 'fill-cyan-300/80' : 'fill-slate-700'}
                      />
                      <text
                        x="4"
                        y="2.5"
                        className={`font-sans text-[8px] ${
                          isDark ? 'fill-slate-400' : 'fill-slate-500'
                        }`}
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
            </g>
          )}
        </g>
      </svg>

      {/* Interactive Hover Tooltip */}
      {hoveredFeature && tooltipPos && (
        <div
          className={`fixed pointer-events-none z-50 p-3 rounded-xl shadow-2xl border backdrop-blur-md text-xs font-mono transition-transform duration-75 ${
            isDark
              ? 'bg-[#090d16]/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/50'
              : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-400/30'
          }`}
          style={{
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y + 16}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1.5 mb-1.5">
            <span className="font-bold font-display text-sm text-cyan-400">
              {hoveredFeature.properties.st_nm}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm]?.type || 'Subdivision'}
            </span>
          </div>

          {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm] && (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Capital:</span>
                <span className="font-semibold text-slate-200">
                  {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].capital}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Area:</span>
                <span className="text-slate-200">
                  {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].areaKm2.toLocaleString()} km²
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Temperature:</span>
                <span className="font-bold text-amber-400">
                  {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].temperature}°C
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Climate Risk:</span>
                <span
                  className={`font-bold ${
                    INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].riskLevel === 'SEVERE'
                      ? 'text-rose-400'
                      : INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].riskLevel === 'HIGH'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {INDIA_STATES_METADATA[hoveredFeature.properties.st_nm].riskLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Map Navigation & Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleReset}
          title="Reset to Full India View"
          className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all shadow-lg flex items-center gap-1.5 ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 text-cyan-300 hover:border-cyan-500/60 hover:bg-slate-800'
              : 'bg-white/95 border-slate-300 text-slate-700 hover:border-sky-500 hover:bg-slate-50'
          }`}
        >
          <span>⊙ Fit Pan-India</span>
        </button>

        {/* Legend for active mode */}
        <div
          className={`p-3 rounded-xl border backdrop-blur-md text-[10px] font-mono shadow-xl max-w-[190px] ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-white/95 border-slate-300 text-slate-700'
          }`}
        >
          <div className="font-bold mb-1 uppercase tracking-wider text-cyan-400">
            {viewMode.toUpperCase()} LAYER
          </div>
          {viewMode === 'political' && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                <span>Selected Focus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
                <span>State Capital</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                <span>Major City</span>
              </div>
            </div>
          )}
          {viewMode === 'thermal' && (
            <div className="space-y-1">
              <div className="h-2 rounded bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-600 w-full" />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>8°C (Alpine)</span>
                <span>38°C (Thar)</span>
              </div>
            </div>
          )}
          {viewMode === 'risk' && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Severe Vulnerability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>High Vulnerability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Low Risk</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
