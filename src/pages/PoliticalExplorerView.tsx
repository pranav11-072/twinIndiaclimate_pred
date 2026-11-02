import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { 
  Search, 
  MapPin, 
  Eye, 
  EyeOff, 
  Compass, 
  Layers, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  ChevronRight, 
  Sparkles, 
  Globe2, 
  Maximize2, 
  Filter,
  Check,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { INDIA_TOPOJSON } from '../data/indiaTopoData';
import { 
  INDIA_STATES_METADATA, 
  SURROUNDING_ENTITIES, 
  StateMetadata 
} from '../data/indiaStatesMetadata';

export type MapViewMode = 'political' | 'thermal' | 'risk';
export type ThemeMode = 'cyber' | 'atlas';

interface PoliticalExplorerViewProps {
  onReturnToTwin?: () => void;
}

export const PoliticalExplorerView: React.FC<PoliticalExplorerViewProps> = ({
  onReturnToTwin,
}) => {
  const allStatesList = useMemo(() => {
    return Object.values(INDIA_STATES_METADATA).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [selectedState, setSelectedState] = useState<StateMetadata>(
    INDIA_STATES_METADATA['Jammu and Kashmir'] || allStatesList[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'State' | 'Union Territory'>('All');
  const [viewMode, setViewMode] = useState<MapViewMode>('political');
  const [theme, setTheme] = useState<ThemeMode>('cyber');
  const [showCapitals, setShowCapitals] = useState<boolean>(true);
  const [showCities, setShowCities] = useState<boolean>(true);
  const [showNeighbors, setShowNeighbors] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);

  // TopoJSON Data State & Loading
  const [topojsonData, setTopojsonData] = useState<any>(INDIA_TOPOJSON);
  const [loadingTopo, setLoadingTopo] = useState<boolean>(false);

  // Map Canvas & SVG References for D3
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width: 850, height: 950 });
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(1);

  // 1. Fetch standard India TopoJSON file on component mount
  useEffect(() => {
    let isMounted = true;
    setLoadingTopo(true);

    fetch('/india-states.topojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.objects) {
          setTopojsonData(data);
        }
      })
      .catch((err) => {
        console.warn('Using embedded standard TopoJSON archive:', err.message);
        if (isMounted) {
          setTopojsonData(INDIA_TOPOJSON);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingTopo(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Convert TopoJSON to GeoJSON FeatureCollection using topojson-client
  const geojsonFeatures = useMemo(() => {
    try {
      if (topojsonData && topojsonData.objects) {
        const key = topojsonData.objects.states ? 'states' : Object.keys(topojsonData.objects)[0];
        if (key && topojsonData.objects[key]) {
          const fc: any = feature(topojsonData, topojsonData.objects[key]);
          return fc;
        }
      }
    } catch (err) {
      console.error('TopoJSON conversion error:', err);
    }
    return { type: 'FeatureCollection', features: [] };
  }, [topojsonData]);

  // 3. Track container dimensions for responsive projection fit
  useEffect(() => {
    const updateSize = () => {
      if (mapContainerRef.current) {
        const { clientWidth, clientHeight } = mapContainerRef.current;
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

  // 4. Set up Mercator Projection scaled to fit container (d3-geo)
  const { projection, pathGenerator } = useMemo(() => {
    const proj = d3
      .geoMercator()
      .fitSize([dimensions.width, dimensions.height], geojsonFeatures);

    const path = d3.geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [dimensions, geojsonFeatures]);

  // 5. Setup D3-Zoom Behavior for smooth panning and zooming across map
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 14])
      .on('zoom', (event) => {
        if (gRef.current) {
          d3.select(gRef.current).attr('transform', event.transform.toString());
        }
        setCurrentZoom(Math.round(event.transform.k * 10) / 10);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial neutral view transform
    svg.call(zoom.transform, d3.zoomIdentity);
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
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
      setCurrentZoom(Math.round(scale * 10) / 10);
    }
  }, [selectedState, pathGenerator, dimensions, geojsonFeatures]);

  // Zoom in & Zoom out helpers using d3-zoom
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 0.71);
  };

  // Reset to full Pan-India View
  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(700)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    setCurrentZoom(1);
  };

  // Color logic based on active mode
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

  // Filtered state list for sidebar
  const filteredStates = useMemo(() => {
    return allStatesList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [allStatesList, searchQuery, typeFilter]);

  const isDark = theme === 'cyber';

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'SEVERE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div
      className={`min-h-[85vh] rounded-2xl border transition-colors flex flex-col overflow-hidden shadow-2xl ${
        isDark
          ? 'bg-[#080b12] border-slate-800 text-slate-100 shadow-cyan-950/20'
          : 'bg-white border-slate-300 text-slate-800 shadow-slate-300/40'
      }`}
    >
      {/* Top Navigation & Controls Bar */}
      <header
        className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'bg-[#0a0e18] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-sky-100 border-sky-300 text-sky-700'
            }`}
          >
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider">
                Survey of India Political Map & Subcontinent Explorer
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}
              >
                SURVEY OF INDIA ACCREDITED
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Official Survey of India boundaries (28 States, 8 UTs) with Siachen, J&K, & Ladakh full extents
            </p>
          </div>
        </div>

        {/* View Tabs & Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* View Mode Tabs */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/80 border-slate-300'
            }`}
          >
            <button
              onClick={() => setViewMode('political')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                viewMode === 'political'
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Political Map
            </button>
            <button
              onClick={() => setViewMode('thermal')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                viewMode === 'thermal'
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal Heatmap
            </button>
            <button
              onClick={() => setViewMode('risk')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                viewMode === 'risk'
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Radar
            </button>
          </div>

          {/* Quick Focus Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Focus State:</span>
            <select
              value={selectedState.id}
              onChange={(e) => {
                const s = INDIA_STATES_METADATA[e.target.value];
                if (s) setSelectedState(s);
              }}
              className={`border text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-cyan-300 focus:border-cyan-500'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
              }`}
            >
              <option value="Jammu and Kashmir">Jammu & Kashmir (Northern Frontier)</option>
              <option value="Ladakh">Ladakh (High-Altitude Front)</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh (Eastern Frontier)</option>
              {allStatesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Layer visibility toggles */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700/60">
            <button
              onClick={() => setShowCapitals(!showCapitals)}
              title={showCapitals ? 'Hide Capitals' : 'Show Capitals'}
              className={`px-2 py-1 rounded border text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                showCapitals
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-sky-100 text-sky-700 border-sky-300'
                  : 'text-slate-400 border-transparent hover:border-slate-700'
              }`}
            >
              <span>Capitals</span>
            </button>

            <button
              onClick={() => setShowCities(!showCities)}
              title={showCities ? 'Hide Major Cities' : 'Show Major Cities'}
              className={`px-2 py-1 rounded border text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                showCities
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-sky-100 text-sky-700 border-sky-300'
                  : 'text-slate-400 border-transparent hover:border-slate-700'
              }`}
            >
              <span>Cities</span>
            </button>

            <button
              onClick={() => setShowNeighbors(!showNeighbors)}
              title={showNeighbors ? 'Hide Neighboring Nations' : 'Show Neighboring Nations'}
              className={`px-2 py-1 rounded border text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                showNeighbors
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-sky-100 text-sky-700 border-sky-300'
                  : 'text-slate-400 border-transparent hover:border-slate-700'
              }`}
            >
              <span>Neighbors & Seas</span>
            </button>
          </div>

          {/* Theme Mode Toggle: "Cyber Dark" vs "Atlas Political" */}
          <button
            onClick={() => setTheme(theme === 'cyber' ? 'atlas' : 'cyber')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 hover:border-sky-500'
            }`}
          >
            {theme === 'cyber' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Atlas Political (Light)</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-500" />
                <span>Cyber Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Sidebar + Central D3 SVG Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Searchable States List & Featured State Card */}
        <aside
          className={`w-full md:w-80 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r overflow-y-auto shrink-0 transition-colors ${
            isDark
              ? 'bg-[#090d16]/95 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, UT, or capital..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter pills: All | States | UTs */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Demarcation:</span>
              <div className="flex gap-1">
                {(['All', 'State', 'Union Territory'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      typeFilter === t
                        ? isDark
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                          : 'bg-sky-600 text-white font-bold border-sky-700'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    {t === 'Union Territory' ? 'UTs (8)' : t === 'State' ? 'States (28)' : 'All (36)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured State Detail Card */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  ★ SELECTED DEMARCATION
                </span>
                <h3 className="text-lg font-bold font-display tracking-tight text-slate-100">
                  {selectedState.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedState.capital} • ISO: IN-{selectedState.code}
                </p>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getRiskBadgeClass(
                  selectedState.riskLevel
                )}`}
              >
                {selectedState.riskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SURFACE AREA</span>
                <span className="font-bold text-slate-200">
                  {selectedState.areaKm2.toLocaleString()} km²
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">POPULATION</span>
                <span className="font-bold text-slate-200">{selectedState.populationM} Million</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TEMPERATURE</span>
                <span className="font-bold text-amber-400">{selectedState.temperature}°C</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">RAINFALL ANOM</span>
                <span
                  className={`font-bold ${
                    selectedState.rainfallAnomalyPct > 0 ? 'text-cyan-400' : 'text-rose-400'
                  }`}
                >
                  {selectedState.rainfallAnomalyPct > 0 ? '+' : ''}
                  {selectedState.rainfallAnomalyPct}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {selectedState.description}
            </p>

            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Terrain: {selectedState.terrain.split('&')[0]}</span>
              <span className="text-cyan-400">Zone: {selectedState.zone}</span>
            </div>
          </div>

          {/* List of All 36 Demarcated Entities */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Entities ({filteredStates.length})</span>
              <span>Click to Focus & Zoom</span>
            </div>

            {filteredStates.map((state) => {
              const isSelected = selectedState.id === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => setSelectedState(state)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                        : 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-900/60 hover:text-slate-100 border border-transparent'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-cyan-400' : 'bg-slate-600'
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate font-semibold">{state.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{state.capital}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400">{state.temperature}°C</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getRiskBadgeClass(
                        state.riskLevel
                      )}`}
                    >
                      {state.riskLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Central D3 India Map Canvas with d3-geo and d3-zoom */}
        <div ref={mapContainerRef} className="flex-1 relative h-full min-h-[600px] overflow-hidden">
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

          {/* SVG D3-Geo Canvas with d3-zoom */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <defs>
              <filter id="explorerCyberGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* D3 Zoom Container Group */}
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
                        filter: isSelected && isDark ? 'url(#explorerCyberGlow)' : undefined,
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
                        if (meta) {
                          setSelectedState(meta);
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
                      <g
                        key={`capital-${state.id}`}
                        transform={`translate(${coords[0]}, ${coords[1]})`}
                      >
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
                        <g
                          key={`city-${city.name}-${idx}`}
                          transform={`translate(${coords[0]}, ${coords[1]})`}
                        >
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
      </div>

      {/* Footer Status Bar as Requested in Prompt */}
      <footer
        className={`px-5 py-2.5 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono ${
          isDark
            ? 'bg-[#07090e] border-slate-800 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            28 STATES & 8 UNION TERRITORIES DEMARCATED (36 UNITS)
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-500">
            Datum: WGS84 / EPSG:4326 Survey of India Boundary Alignment • D3 Mercator
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onReturnToTwin && (
            <button
              onClick={onReturnToTwin}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all shadow-sm cursor-pointer ${
                isDark
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
                  : 'bg-sky-600 border-sky-700 text-white hover:bg-sky-500'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Return to 3D Climate Twin →</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
