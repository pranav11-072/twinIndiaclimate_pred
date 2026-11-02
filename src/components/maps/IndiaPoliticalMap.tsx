import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom as d3Zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { feature } from 'topojson-client';
import { INDIA_TOPOJSON } from '../../data/indiaTopoData';
import { 
  INDIA_STATES_METADATA, 
  SURROUNDING_ENTITIES, 
  StateMetadata 
} from '../../data/indiaStatesMetadata';

export type MapViewMode = 'political' | 'thermal' | 'risk';
export type ThemeMode = 'cyber' | 'atlas';

export interface IndiaPoliticalMapProps {
  selectedState?: StateMetadata | null;
  onSelectState?: (state: StateMetadata) => void;
  viewMode?: MapViewMode;
  theme?: ThemeMode;
  showCapitals?: boolean;
  showCities?: boolean;
  showNeighbors?: boolean;
  showBoundaries?: boolean;
  className?: string;
  onResetZoom?: () => void;
}

/**
 * IndiaPoliticalMap
 * 
 * High-fidelity India State & UT administrative boundary map using:
 * - 'd3-geo' with a Mercator projection scaled to fit container
 * - Valid TopoJSON administrative boundaries with Survey of India frontiers
 * - 'd3-zoom' for fluid pan & zoom interactivity with animated transitions
 */
export const IndiaPoliticalMap: React.FC<IndiaPoliticalMapProps> = ({
  selectedState = null,
  onSelectState,
  viewMode = 'political',
  theme = 'cyber',
  showCapitals = true,
  showCities = true,
  showNeighbors = true,
  showBoundaries = true,
  className = '',
  onResetZoom,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width: 850, height: 950 });
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [topojsonData, setTopojsonData] = useState<any>(INDIA_TOPOJSON);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Fetch official TopoJSON file with fallback to bundled INDIA_TOPOJSON
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('/india-states.topojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.objects) {
          setTopojsonData(data);
        }
      })
      .catch((err) => {
        console.warn('Falling back to embedded TopoJSON dataset:', err.message);
        if (isMounted) setTopojsonData(INDIA_TOPOJSON);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Convert TopoJSON to GeoJSON FeatureCollection using topojson-client
  const geojsonFeatures = useMemo(() => {
    try {
      const topology = topojsonData as any;
      if (topology && topology.objects) {
        const objectKey = topology.objects.states ? 'states' : Object.keys(topology.objects)[0];
        if (objectKey && topology.objects[objectKey]) {
          const fc: any = feature(topology, topology.objects[objectKey]);
          return fc;
        }
      }
    } catch (e) {
      console.error('Failed to convert TopoJSON to GeoJSON:', e);
    }
    return { type: 'FeatureCollection', features: [] };
  }, [topojsonData]);

  // 3. Responsive dimension detection
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth > 0 ? clientWidth : 850,
          height: clientHeight > 0 ? clientHeight : 950,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 4. D3-Geo Mercator projection scaled to fit container
  const { projection, pathGenerator } = useMemo(() => {
    const proj = geoMercator()
      .fitSize([dimensions.width, dimensions.height], geojsonFeatures);

    const path = geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [dimensions, geojsonFeatures]);

  // 5. Setup D3-Zoom behavior for smooth panning and zooming
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 14])
      .on('zoom', (event) => {
        if (gRef.current) {
          d3.select(gRef.current).attr('transform', event.transform.toString());
        }
        setCurrentZoom(Math.round(event.transform.k * 10) / 10);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial neutral zoom
    svg.call(zoom.transform, zoomIdentity);
  }, []);

  // 6. Smooth animated zoom to selected state's bounding box
  useEffect(() => {
    if (!selectedState || !svgRef.current || !zoomBehaviorRef.current) return;

    const featureObj = geojsonFeatures.features.find(
      (f: any) =>
        f.properties?.st_nm?.toLowerCase() === selectedState.name.toLowerCase() ||
        f.properties?.st_nm?.toLowerCase() === selectedState.id.toLowerCase()
    );

    if (featureObj && pathGenerator) {
      const bounds = pathGenerator.bounds(featureObj);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;
      const maxDim = Math.max(dx / dimensions.width, dy / dimensions.height, 0.02);
      const scale = Math.max(1, Math.min(6.5, 0.75 / maxDim));
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
          zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
      setCurrentZoom(Math.round(scale * 10) / 10);
    }
  }, [selectedState, pathGenerator, dimensions, geojsonFeatures]);

  // Zoom helpers
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 0.71);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(700)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
    setCurrentZoom(1);
    if (onResetZoom) onResetZoom();
  }, [onResetZoom]);

  // Styling and theme helpers
  const isDark = theme === 'cyber';

  const getFeatureFill = (stateName: string, isSelected: boolean) => {
    const meta = INDIA_STATES_METADATA[stateName];

    if (viewMode === 'political') {
      if (theme === 'cyber') {
        if (isSelected) return '#06b6d4'; // glowing cyber cyan
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
      const temp = meta ? meta.temperature : 28;
      const tNorm = Math.min(1, Math.max(0, (temp - 8) / 30));
      return d3.interpolateTurbo(tNorm);
    } else {
      const risk = meta ? meta.riskLevel : 'LOW';
      if (risk === 'SEVERE') return theme === 'cyber' ? '#dc2626' : '#ef4444';
      if (risk === 'HIGH') return theme === 'cyber' ? '#ea580c' : '#f97316';
      if (risk === 'MODERATE') return theme === 'cyber' ? '#d97706' : '#f59e0b';
      return theme === 'cyber' ? '#059669' : '#10b981';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden transition-colors duration-300 select-none ${
        isDark ? 'bg-[#06080e] text-slate-100' : 'bg-[#f1f5f9] text-slate-800'
      } ${className}`}
    >
      {/* Background Cartographic Matrix Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(#0891b2 1px, transparent 1px), linear-gradient(to right, #0e1e2d 1px, transparent 1px), linear-gradient(to bottom, #0e1e2d 1px, transparent 1px)'
            : 'radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span>Synchronizing Survey of India TopoJSON...</span>
        </div>
      )}

      {/* SVG Canvas for D3 Geo rendering */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          <filter id="indiaCyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
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

          {/* Surrounding Sovereign Nations */}
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

          {/* State / UT Boundaries from TopoJSON */}
          <g className="states-polygons">
            {geojsonFeatures.features.map((featureObj: any, index: number) => {
              const stateName = featureObj.properties?.st_nm;
              const isSelected =
                selectedState?.name === stateName || selectedState?.id === stateName;
              const isHovered = hoveredFeature?.properties?.st_nm === stateName;
              const d = pathGenerator(featureObj);
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
                    filter: isSelected && isDark ? 'url(#indiaCyberGlow)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    setHoveredFeature(featureObj);
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
                    if (meta && onSelectState) {
                      onSelectState(meta);
                    }
                  }}
                />
              );
            })}
          </g>

          {/* Northern Frontier Boundary Overlay */}
          {showBoundaries && (
            <g className="demarcated-frontiers pointer-events-none opacity-80">
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

          {/* State Capitals Layer */}
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
                    <circle r={1.2} className={isDark ? 'fill-slate-950' : 'fill-white'} />
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

          {/* Major Cities Layer */}
          {showCities && (
            <g className="cities-layer pointer-events-none">
              {Object.values(INDIA_STATES_METADATA)
                .flatMap((s) => s.majorCities.filter((c) => !c.isCapital))
                .map((city, idx) => {
                  const coords = projection([city.lng, city.lat]);
                  if (!coords) return null;
                  return (
                    <g key={`city-${city.name}-${idx}`} transform={`translate(${coords[0]}, ${coords[1]})`}>
                      <circle r="2.2" className={isDark ? 'fill-cyan-300/80' : 'fill-slate-700'} />
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

      {/* Floating Hover Tooltip */}
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
              {hoveredFeature.properties?.st_nm}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm]?.type || 'Demarcation'}
            </span>
          </div>

          {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm] && (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Capital:</span>
                <span className="font-semibold text-slate-200">
                  {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].capital}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Area:</span>
                <span className="text-slate-200">
                  {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].areaKm2.toLocaleString()} km²
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Temperature:</span>
                <span className="font-bold text-amber-400">
                  {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].temperature}°C
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Climate Risk:</span>
                <span
                  className={`font-bold ${
                    INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].riskLevel === 'SEVERE'
                      ? 'text-rose-400'
                      : INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].riskLevel === 'HIGH'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {INDIA_STATES_METADATA[hoveredFeature.properties?.st_nm].riskLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Map Navigation & Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        <div className="flex items-center gap-1.5 shadow-lg">
          <div
            className={`flex items-center rounded-xl border overflow-hidden ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-cyan-300'
                : 'bg-white/95 border-slate-300 text-slate-700'
            }`}
          >
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="px-3 py-2 text-sm font-bold hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors cursor-pointer border-r border-slate-700/60"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (−)"
              className="px-3 py-2 text-sm font-bold hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors cursor-pointer"
            >
              −
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            title="Reset to Full Pan-India View"
            className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-cyan-300 hover:border-cyan-500/60 hover:bg-slate-800'
                : 'bg-white/95 border-slate-300 text-slate-700 hover:border-sky-500 hover:bg-slate-50'
            }`}
          >
            <span>⊙ Fit Pan-India</span>
            {currentZoom !== 1 && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                {currentZoom}x
              </span>
            )}
          </button>
        </div>

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
                <span>Severe Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>High Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Moderate Risk</span>
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

export default IndiaPoliticalMap;
