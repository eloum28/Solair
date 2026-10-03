import React from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Cpu, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  Tv,
  Refrigerator,
  Fan,
  Lightbulb,
  Wifi,
  Laptop
} from 'lucide-react';
import { Project, Appliance, CalculationResults } from '../types/solar';
import { Translations } from '../lib/translations';

interface QuickDesignViewProps {
  project: Project;
  results: CalculationResults;
  onUpdateAppliances: (appliances: Appliance[]) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onSwitchMode: (mode: 'engineering' | 'professional') => void;
  t: Translations;
}

export const QuickDesignView: React.FC<QuickDesignViewProps> = ({
  project,
  results,
  onUpdateAppliances,
  onUpdateProject,
  onSwitchMode,
  t,
}) => {
  const currencySymbol = project.costs.currency === 'EUR' ? '€' : project.costs.currency === 'XOF' ? 'FCFA ' : '$';
  const fmt = (v: number) => new Intl.NumberFormat().format(Math.round(v));

  // Quick appliance quantity toggle
  const handleQuantityChange = (appId: string, delta: number) => {
    const updated = project.appliances.map((app) => {
      if (app.id === appId) {
        const nextQty = Math.max(0, app.quantity + delta);
        return { ...app, quantity: nextQty, enabled: nextQty > 0 };
      }
      return app;
    });
    onUpdateAppliances(updated);
  };

  const getApplianceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('light')) return <Lightbulb className="w-5 h-5 text-amber-400" />;
    if (lower.includes('fridge') || lower.includes('refrigerator') || lower.includes('freezer')) return <Refrigerator className="w-5 h-5 text-cyan-400" />;
    if (lower.includes('fan') || lower.includes('conditioner')) return <Fan className="w-5 h-5 text-blue-400" />;
    if (lower.includes('tv') || lower.includes('television')) return <Tv className="w-5 h-5 text-purple-400" />;
    if (lower.includes('wifi') || lower.includes('router')) return <Wifi className="w-5 h-5 text-teal-400" />;
    if (lower.includes('laptop') || lower.includes('computer')) return <Laptop className="w-5 h-5 text-indigo-400" />;
    return <Zap className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Homeowner Hero Banner */}
      <div className="bg-gradient-to-r from-[#111e38] to-[#172b50] border border-[#1e3a5f] rounded-2xl p-6 sm:p-8 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-semibold">
                QUICK DESIGN MODE
              </span>
              <span className="text-xs text-slate-400 font-mono">Homeowner Sizing Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Plan Your Off-Grid Solar System
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Adjust your household appliances below. VoltPlan calculates your exact solar array, battery bank size, and estimated investment in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSwitchMode('engineering')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <span>Engineering Design</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('professional')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Professional Validation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sizing Recommendations Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Daily Energy Consumption */}
        <div className="p-4 rounded-2xl bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Daily Energy Usage</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white light:text-slate-900">
            {results.dailyKwh} <span className="text-sm font-normal text-slate-400">kWh/day</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {Math.round(results.daytimePercentage)}% Day · {Math.round(results.nighttimePercentage)}% Night
          </span>
        </div>

        {/* Recommended Solar Array */}
        <div className="p-4 rounded-2xl bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Recommended Solar</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {(results.actualArrayWatts / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">kW</span>
          </div>
          <span className="text-xs text-slate-300 light:text-slate-600 mt-1 block font-mono">
            {results.panelCount} × {results.panelWattage}W Solar Panels
          </span>
        </div>

        {/* Recommended Battery Storage */}
        <div className="p-4 rounded-2xl bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Battery Storage</span>
            <BatteryCharging className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">
            {results.installedNominalBatteryKwh} <span className="text-sm font-normal text-slate-400">kWh</span>
          </div>
          <span className="text-xs text-slate-300 light:text-slate-600 mt-1 block font-mono">
            {results.actualAutonomyDays} days backup autonomy
          </span>
        </div>

        {/* Estimated Turnkey Cost */}
        <div className="p-4 rounded-2xl bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Estimated Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {currencySymbol}{fmt(results.costs.grandTotal)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono">
            Equipment: {currencySymbol}{fmt(results.costs.equipmentSubtotal)}
          </span>
        </div>

      </div>

      {/* Interactive Home Appliance Schedule */}
      <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 light:border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
              Connected Household Appliances
            </h3>
            <p className="text-xs text-slate-400">
              Tap + or − to adjust your household devices. Sizing calculations update immediately.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {project.appliances.filter((a) => a.enabled && a.quantity > 0).length} Active Types
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.appliances.map((app) => (
            <div
              key={app.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                app.quantity > 0 && app.enabled
                  ? 'bg-[#0b1329] light:bg-slate-50 border-slate-700/80 shadow-sm'
                  : 'bg-[#0b1329]/40 light:bg-slate-100/60 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-700/60">
                  {getApplianceIcon(app.name)}
                </span>
                <div>
                  <div className="font-semibold text-xs text-white light:text-slate-900 truncate max-w-[150px]">
                    {app.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {app.watts}W · {app.hoursPerDay}h/day
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(app.id, -1)}
                  disabled={app.quantity <= 0}
                  className="w-7 h-7 rounded-lg bg-[#111e38] light:bg-white hover:bg-slate-700 text-slate-300 light:text-slate-700 border border-slate-700 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-white light:text-slate-900">
                  {app.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(app.id, 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center justify-center transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homeowner Autonomy Slider Card */}
      <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider font-mono">
              Desired No-Sun Backup Duration (Days of Autonomy)
            </h4>
          </div>
          <span className="font-mono font-bold text-teal-400 text-sm">
            {project.battery.autonomyDays} {project.battery.autonomyDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          How many consecutive cloudy or rainy days should your batteries power your home without solar generation?
        </p>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.5"
          value={project.battery.autonomyDays}
          onChange={(e) => onUpdateProject({
            battery: {
              ...project.battery,
              autonomyDays: parseFloat(e.target.value),
            },
          })}
          className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
          <span>0.5 Day (Overnight Only)</span>
          <span>1.0 Day (Recommended Standard)</span>
          <span>2.0 Days (High Reliability)</span>
          <span>3.0 Days (Mission Critical)</span>
        </div>
      </div>

    </div>
  );
};
