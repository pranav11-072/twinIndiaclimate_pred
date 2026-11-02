import React from 'react';
import { Activity, Bell, Shield, User, Globe, Sparkles, Terminal, Box, Bot } from 'lucide-react';
import { BadgeTag } from './BadgeTag';

interface HeaderProps {
  onOpenAlerts?: () => void;
  unreadAlertsCount?: number;
  onOpenApiModal?: () => void;
  activeViewTitle?: string;
  onNavigateToPolitical?: () => void;
  onNavigateToObservatory?: () => void;
  onNavigateToChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlerts,
  unreadAlertsCount = 4,
  onOpenApiModal,
  onNavigateToPolitical,
  onNavigateToObservatory,
  onNavigateToChat,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent border border-cyan-500/30 text-cyan-400 shadow-inner">
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold tracking-wider uppercase font-display text-slate-100 sm:text-lg">
              AI-POWERED DIGITAL TWIN
            </h1>
            <BadgeTag tag="DEMO" size="sm" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              TWIN ONLINE
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400">
            India Climate Intelligence & Adaptation Platform • ConvLSTM Engine
          </p>
        </div>
      </div>

      {/* Telemetry & User Command Controls */}
      <div className="flex items-center gap-3">
        {/* System Time & Status Widget */}
        <div className="hidden lg:flex flex-col items-end pr-3 border-r border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>● 0.10° REGRID MESH RUNNING</span>
          </div>
          <span className="text-slate-400">Last updated: 25 Sep 2026 | 18:30 IST</span>
        </div>

        {/* 3D Observatory button */}
        {onNavigateToObservatory && (
          <button
            onClick={onNavigateToObservatory}
            title="Interactive Three.js 3D Climate Observatory"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">3D Observatory</span>
          </button>
        )}

        {/* Gemini Chat Copilot button */}
        {onNavigateToChat && (
          <button
            onClick={onNavigateToChat}
            title="Open Gemini Climate Intelligence Copilot"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gemini AI</span>
          </button>
        )}

        {/* Political Map Explorer button */}
        {onNavigateToPolitical && (
          <button
            onClick={onNavigateToPolitical}
            title="Survey of India Accurate Political Map"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SOI Map (28+8)</span>
          </button>
        )}

        {/* API Inspector button */}
        <button
          onClick={onOpenApiModal}
          title="Inspect REST API endpoints & JSON payloads"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-slate-900/90 text-slate-300 border border-slate-700/60 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">REST API</span>
        </button>

        {/* Extreme Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
          title="Active Weather Advisories"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold font-mono text-white bg-amber-500 rounded-full">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile / Role Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left text-xs font-mono">
            <div className="text-slate-200 font-semibold leading-tight flex items-center gap-1">
              <span>Dr. R. Sen</span>
              <Shield className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Climate Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
};
