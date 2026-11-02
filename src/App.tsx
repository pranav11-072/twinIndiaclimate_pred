/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavView } from './components/Sidebar';
import { AlertPanel } from './components/AlertPanel';
import { ApiModal } from './components/ApiModal';
import { INDIAN_REGIONS } from './data/regionsData';
import { RegionalClimateData, ClimateVariable } from './types/climate';
import { EXTREME_WEATHER_ALERTS } from './data/historicalData';

// View Pages
import { DashboardView } from './pages/DashboardView';
import { PoliticalExplorerView } from './pages/PoliticalExplorerView';
import { DigitalTwinView } from './pages/DigitalTwinView';
import { ForecastView } from './pages/ForecastView';
import { HistoricalTrendsView } from './pages/HistoricalTrendsView';
import { ScenarioSimulatorView } from './pages/ScenarioSimulatorView';
import { ClimateRiskView } from './pages/ClimateRiskView';
import { ModelPerformanceView } from './pages/ModelPerformanceView';
import { DataSourcesView } from './pages/DataSourcesView';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [selectedRegion, setSelectedRegion] = useState<RegionalClimateData>(INDIAN_REGIONS[0]); // Karnataka default
  const [activeVariable, setActiveVariable] = useState<ClimateVariable>('rainfall');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);

  const handleSelectRegionByName = (name: string) => {
    const found = INDIAN_REGIONS.find((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      setSelectedRegion(found);
      setCurrentView('political-explorer');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        onOpenAlerts={() => setAlertsOpen(true)}
        unreadAlertsCount={EXTREME_WEATHER_ALERTS.length}
        onOpenApiModal={() => setApiModalOpen(true)}
        onNavigateToPolitical={() => setCurrentView('political-explorer')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {currentView === 'overview' && (
            <DashboardView
              regions={INDIAN_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              activeVariable={activeVariable}
              onChangeVariable={setActiveVariable}
              onNavigate={(v) => setCurrentView(v)}
              onOpenAlerts={() => setAlertsOpen(true)}
            />
          )}

          {currentView === 'political-explorer' && (
            <PoliticalExplorerView onReturnToTwin={() => setCurrentView('digital-twin')} />
          )}

          {currentView === 'digital-twin' && <DigitalTwinView />}

          {currentView === 'forecast' && (
            <ForecastView
              regions={INDIAN_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          )}

          {currentView === 'trends' && (
            <HistoricalTrendsView
              regions={INDIAN_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          )}

          {currentView === 'scenario-lab' && (
            <ScenarioSimulatorView
              regions={INDIAN_REGIONS}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          )}

          {currentView === 'climate-risk' && (
            <ClimateRiskView
              regions={INDIAN_REGIONS}
              onSelectRegion={(r) => {
                setSelectedRegion(r);
                setCurrentView('political-explorer');
              }}
              onNavigateToMap={() => setCurrentView('political-explorer')}
            />
          )}

          {currentView === 'model-performance' && <ModelPerformanceView />}

          {currentView === 'data-sources' && <DataSourcesView />}
        </main>
      </div>

      {/* Extreme Weather Advisory Drawer */}
      <AlertPanel
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        onSelectRegion={handleSelectRegionByName}
      />

      {/* REST API Playground Modal */}
      <ApiModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />

      {/* Scientific Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-[#07090e] text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>● AI-POWERED DIGITAL TWIN OF INDIA'S CLIMATE (POC v1.0)</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400">IMD 0.25° • ISRO MOSDAC INSAT-3DR</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>ConvLSTM Spatiotemporal Pipeline</span>
          <button
            onClick={() => setApiModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            API Docs
          </button>
        </div>
      </footer>
    </div>
  );
}
