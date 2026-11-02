import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  ShieldAlert,
  BarChart3,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from 'lucide-react';

export type NavView = 
  | 'overview' 
  | 'political-explorer'
  | 'digital-twin' 
  | 'forecast' 
  | 'trends' 
  | 'scenario-lab' 
  | 'climate-risk' 
  | 'model-performance' 
  | 'data-sources';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'political-explorer', label: 'Political Map (SOI)', icon: Compass, badge: 'Official SOI' },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu, badge: '5-Spheres' },
    { id: 'forecast', label: 'AI Forecast', icon: Sparkles, badge: 'ConvLSTM' },
    { id: 'trends', label: 'Climate Trends', icon: TrendingUp },
    { id: 'scenario-lab', label: 'Scenario Lab', icon: SlidersHorizontal, badge: 'What-If' },
    { id: 'climate-risk', label: 'Climate Risk', icon: ShieldAlert },
    { id: 'model-performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'data-sources', label: 'Data Sources', icon: Database, badge: 'National' },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col justify-between border-r border-slate-800/80 bg-[#0a0d14]/95 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold flex items-center justify-between">
          {!collapsed && <span>Intelligence Modules</span>}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Card in Sidebar */}
      {!collapsed ? (
        <div className="p-3 m-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>GRID RESOLUTION</span>
            <span className="text-cyan-400">0.25° × 0.25°</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Active Pilot Region</span>
            <span className="text-slate-200">Karnataka / S.Pen</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[88%]" />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
            <span>INSAT-3DR assimilation</span>
            <span className="text-emerald-400">Synced</span>
          </div>
        </div>
      ) : (
        <div className="p-2 flex justify-center text-slate-600">
          <Layers className="w-4 h-4" />
        </div>
      )}
    </aside>
  );
};
