import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SystemOverview } from './components/SystemOverview';
import { StatusAlerts } from './components/StatusAlerts';
import { ApplianceEstimator } from './components/ApplianceEstimator';
import { SolarSettings } from './components/SolarSettings';
import { BatterySettings } from './components/BatterySettings';
import { InverterMPPTSettings } from './components/InverterMPPTSettings';
import { Battery24hGraph } from './components/Battery24hGraph';
import { MarketPrices } from './components/MarketPrices';
import { StringDesignCalculator } from './components/StringDesignCalculator';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { PrintReportModal } from './components/PrintReportModal';
import { AuditModal } from './components/AuditModal';
import { QuickDesignView } from './components/QuickDesignView';
import { ProfessionalValidationView } from './components/ProfessionalValidationView';
import { BreakpointDebugger } from './components/BreakpointDebugger';

import { Project, Appliance, LocationConfig, SolarArrayConfig, BatteryConfig, InverterConfig, MPPTConfig, CostConfig, AdvancedSettings, StringDesignConfig, SimulationConfig, AppDesignMode } from './types/solar';
import { calculateCompleteSystem } from './lib/solarCalculations';
import { INITIAL_DEMO_PROJECT } from './lib/presets';
import { translations, SupportedLanguage } from './lib/translations';

const STORAGE_PROJECTS_KEY = 'voltplan_saved_projects_v1';
const STORAGE_CURRENT_ID_KEY = 'voltplan_active_project_id';
const STORAGE_LANG_KEY = 'voltplan_user_lang';
const STORAGE_THEME_KEY = 'voltplan_user_theme';

export default function App() {
  // Theme state: dark / light
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved !== null ? saved === 'dark' : true;
  });

  // Language state: en / fr
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
    return saved === 'fr' ? 'fr' : 'en';
  });

  // Saved projects collection
  const [savedProjects, setSavedProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [INITIAL_DEMO_PROJECT];
  });

  // Active project ID
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_CURRENT_ID_KEY);
    return stored || INITIAL_DEMO_PROJECT.id;
  });

  // Active project object
  const currentProject = useMemo(() => {
    const found = savedProjects.find((p) => p.id === activeProjectId);
    return found || savedProjects[0] || INITIAL_DEMO_PROJECT;
  }, [savedProjects, activeProjectId]);

  // Modals state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeAuditKey, setActiveAuditKey] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);

  // Simulation mode state (Typical Solar Day, Cloudy Day, No-Sun Autonomy)
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    mode: 'typical',
    cloudyFactor: 0.30,
    hours: 24,
  });

  // Sync theme class to documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem(STORAGE_THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist language
  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, currentLang);
  }, [currentLang]);

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(savedProjects));
      localStorage.setItem(STORAGE_CURRENT_ID_KEY, activeProjectId);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [savedProjects, activeProjectId]);

  // Central Calculation Engine Execution (Single Source of Truth)
  const calculationResults = useMemo(() => {
    return calculateCompleteSystem(
      currentProject.appliances,
      currentProject.location,
      currentProject.solar,
      currentProject.battery,
      currentProject.inverter,
      currentProject.mppt,
      currentProject.advanced,
      currentProject.costs,
      currentProject.stringDesign,
      simulationConfig
    );
  }, [
    currentProject.appliances,
    currentProject.location,
    currentProject.solar,
    currentProject.battery,
    currentProject.inverter,
    currentProject.mppt,
    currentProject.advanced,
    currentProject.costs,
    currentProject.stringDesign,
    simulationConfig,
  ]);

  // Active design mode: 'quick' | 'engineering' | 'professional'
  const [activeMode, setActiveMode] = useState<AppDesignMode>(() => currentProject.designMode || 'engineering');

  useEffect(() => {
    if (currentProject.designMode && currentProject.designMode !== activeMode) {
      setActiveMode(currentProject.designMode);
    }
  }, [currentProject.id]);

  const handleSelectMode = (mode: AppDesignMode) => {
    setActiveMode(mode);
    updateActiveProject({ designMode: mode });
  };

  // Helper to update active project state
  const updateActiveProject = (updatedFields: Partial<Project>) => {
    setSavedProjects((prev) =>
      prev.map((p) =>
        p.id === currentProject.id
          ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  // Project Management Handlers
  const handleNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProj: Project = {
      ...INITIAL_DEMO_PROJECT,
      id: newId,
      name: `Solar Project ${savedProjects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newId);
  };

  const handleDuplicateProject = () => {
    const dupId = `project-${Date.now()}`;
    const dupProj: Project = {
      ...currentProject,
      id: dupId,
      name: `${currentProject.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedProjects((prev) => [...prev, dupProj]);
    setActiveProjectId(dupId);
  };

  const handleRenameProject = (newName: string) => {
    updateActiveProject({ name: newName });
  };

  const handleDeleteProject = () => {
    if (savedProjects.length <= 1) return;
    const remaining = savedProjects.filter((p) => p.id !== currentProject.id);
    setSavedProjects(remaining);
    setActiveProjectId(remaining[0].id);
  };

  const handleExportProject = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sizing.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.appliances && imported.solar && imported.battery) {
          const newId = `imported-${Date.now()}`;
          const safeProject: Project = {
            ...imported,
            id: newId,
            name: imported.name || 'Imported Project',
            updatedAt: new Date().toISOString(),
          };
          setSavedProjects((prev) => [...prev, safeProject]);
          setActiveProjectId(newId);
        }
      } catch (err) {
        console.error('Invalid JSON project configuration:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const t = translations[currentLang];

  return (
    <div className="min-h-screen w-full max-w-full min-w-0 bg-[#0b1329] light:bg-[#f8fafc] text-slate-100 light:text-slate-900 transition-colors flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Bar Header */}
      <Header
        t={t}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        currentProject={currentProject}
        savedProjects={savedProjects}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        onSelectProject={setActiveProjectId}
        onNewProject={handleNewProject}
        onSaveProject={() => updateActiveProject({})}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        onOpenReport={() => setIsReportOpen(true)}
        saveNotice={saveNotice}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
        
        {/* Invariant Error Banner (Requirement 16) */}
        {calculationResults.invariantErrors.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-mono shadow-xl">
            <div className="font-bold text-sm text-rose-400 mb-1">Calculation Consistency Error Detected:</div>
            <ul className="list-disc pl-5 space-y-0.5">
              {calculationResults.invariantErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 1. QUICK DESIGN MODE (Simplified Homeowner Interface) */}
        {activeMode === 'quick' && (
          <QuickDesignView
            project={currentProject}
            results={calculationResults}
            onUpdateAppliances={(apps: Appliance[]) => updateActiveProject({ appliances: apps })}
            onUpdateProject={updateActiveProject}
            onSwitchMode={handleSelectMode}
            t={t}
          />
        )}

        {/* 2. ENGINEERING DESIGN MODE (Full Dashboard Preserved Exactly) */}
        {activeMode === 'engineering' && (
          <>
            {/* Top Section 1: SYSTEM OVERVIEW (Key Engineering Numbers) */}
            <SystemOverview
              results={calculationResults}
              costs={currentProject.costs}
              t={t}
              onOpenAudit={(key) => setActiveAuditKey(key)}
            />

            {/* Section 13: Engineering Status & Actionable Alerts */}
            <StatusAlerts
              results={calculationResults}
              t={t}
              onNavigateToValidation={() => handleSelectMode('professional')}
            />

            {/* Responsive Dashboard: Two columns on >= 1200px (Desktop), Single column with logical engineering order on mobile */}
            <div className="w-full flex flex-col xl:grid xl:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Solar, Battery, Pricing, Deratings */}
              <div className="contents xl:block xl:col-span-5 space-y-6">
                
                {/* 4. Solar Resource & Location (Mobile order 4) */}
                <div className="order-2 xl:order-none w-full">
                  <SolarSettings
                    location={currentProject.location}
                    onUpdateLocation={(loc: LocationConfig) => updateActiveProject({ location: loc })}
                    solar={currentProject.solar}
                    onUpdateSolar={(sol: SolarArrayConfig) => updateActiveProject({ solar: sol })}
                    results={calculationResults}
                    t={t}
                    onOpenAudit={(key) => setActiveAuditKey(key)}
                  />
                </div>

                {/* 5. Battery Bank Storage Configuration (Mobile order 5) */}
                <div className="order-3 xl:order-none w-full">
                  <BatterySettings
                    battery={currentProject.battery}
                    onUpdateBattery={(bat: BatteryConfig) => updateActiveProject({ battery: bat })}
                    results={calculationResults}
                    t={t}
                    onOpenAudit={(key) => setActiveAuditKey(key)}
                  />
                </div>

                {/* 9. Market Prices & Cost Breakdown (Mobile order 9) */}
                <div className="order-7 xl:order-none w-full">
                  <MarketPrices
                    costs={currentProject.costs}
                    onUpdateCosts={(costs: CostConfig) => updateActiveProject({ costs })}
                    results={calculationResults}
                    t={t}
                  />
                </div>

                {/* 10. Advanced Settings Accordion Trigger (Mobile order 10) */}
                <div className="order-8 xl:order-none w-full p-4 rounded-xl bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white light:text-slate-900">Thermodynamic & Cable Deratings</div>
                    <div className="text-slate-400 text-[11px]">System losses: {Math.round(currentProject.advanced.systemLosses * 100)}% · Inverter eff: {Math.round(currentProject.advanced.inverterEfficiency * 100)}%</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 font-medium shrink-0"
                  >
                    {t.advancedSettings}
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: Load Estimator, 24h Graph, Inverter & MPPT, String Design */}
              <div className="contents xl:block xl:col-span-7 space-y-6">
                
                {/* 3. Appliance Load Estimator & Day/Night Split (Mobile order 3) */}
                <div className="order-1 xl:order-none w-full">
                  <ApplianceEstimator
                    appliances={currentProject.appliances}
                    onUpdateAppliances={(apps: Appliance[]) => updateActiveProject({ appliances: apps })}
                    daytimeWh={calculationResults.daytimeWh}
                    nighttimeWh={calculationResults.nighttimeWh}
                    daytimePercentage={calculationResults.daytimePercentage}
                    nighttimePercentage={calculationResults.nighttimePercentage}
                    t={t}
                  />
                </div>

                {/* 6. Battery 24-Hour Cycle Graph (Mobile order 6) */}
                <div className="order-4 xl:order-none w-full">
                  <Battery24hGraph
                    results={calculationResults}
                    isDark={isDark}
                    t={t}
                    onOpenAudit={(key) => setActiveAuditKey(key)}
                    simulationConfig={simulationConfig}
                    onUpdateSimulation={setSimulationConfig}
                  />
                </div>

                {/* 7. Inverter & MPPT Conversion (Mobile order 7) */}
                <div className="order-5 xl:order-none w-full">
                  <InverterMPPTSettings
                    inverter={currentProject.inverter}
                    onUpdateInverter={(inv: InverterConfig) => updateActiveProject({ inverter: inv })}
                    mppt={currentProject.mppt}
                    onUpdateMPPT={(mppt: MPPTConfig) => updateActiveProject({ mppt })}
                    results={calculationResults}
                    t={t}
                    onOpenAudit={(key) => setActiveAuditKey(key)}
                  />
                </div>

                {/* 8. Advanced Panel String Design Matching (Mobile order 8) */}
                <div className="order-6 xl:order-none w-full">
                  <StringDesignCalculator
                    stringConfig={currentProject.stringDesign}
                    onUpdateStringConfig={(str: StringDesignConfig) => updateActiveProject({ stringDesign: str })}
                    mpptConfig={currentProject.mppt}
                    totalPanels={calculationResults.panelCount}
                    result={calculationResults.stringDesign}
                    t={t}
                  />
                </div>

              </div>

            </div>
          </>
        )}

        {/* 3. PROFESSIONAL VALIDATION MODE */}
        {activeMode === 'professional' && (
          <ProfessionalValidationView
            project={currentProject}
            results={calculationResults}
            onUpdateProject={updateActiveProject}
            t={t}
            isDark={isDark}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 light:border-slate-200 py-4 px-6 text-center text-xs text-slate-400 light:text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            VoltPlan · Engineering-grade off-grid photovoltaic & energy storage sizing.
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Calculations compliant with IEEE 1013 & NEC 690
          </div>
        </div>
      </footer>

      {/* Advanced Settings Modal */}
      <AdvancedSettingsModal
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        settings={currentProject.advanced}
        onUpdateSettings={(adv: AdvancedSettings) => updateActiveProject({ advanced: adv })}
        t={t}
      />

      {/* Professional PDF / Print Report Modal */}
      <PrintReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        project={currentProject}
        results={calculationResults}
        t={t}
      />

      {/* Engineering Calculation Audit Modal (Requirement 14) */}
      <AuditModal
        isOpen={Boolean(activeAuditKey)}
        onClose={() => setActiveAuditKey(null)}
        auditItem={activeAuditKey ? calculationResults.audits[activeAuditKey] : undefined}
      />

      {/* Temporary Breakpoint Debugger (Requirement 2) */}
      <BreakpointDebugger />

    </div>
  );
}
