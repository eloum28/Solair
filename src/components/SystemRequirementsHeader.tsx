import React from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Cpu, 
  Sliders, 
  Clock, 
  ShieldAlert, 
  ArrowLeft,
  Lock,
  Layers
} from 'lucide-react';
import { CalculationResults } from '../types/solar';

interface SystemRequirementsHeaderProps {
  results: CalculationResults;
  onReturnToEngineering?: () => void;
}

export const SystemRequirementsHeader: React.FC<SystemRequirementsHeaderProps> = ({
  results,
  onReturnToEngineering,
}) => {
  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
                System Requirements (Engineering Design Baseline)
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>READ-ONLY</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Pushed directly from the central calculation engine. To modify system load or sizing targets, return to Engineering Design.
            </p>
          </div>
        </div>

        {onReturnToEngineering && (
          <button
            type="button"
            onClick={onReturnToEngineering}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Engineering Design</span>
          </button>
        )}
      </div>

      {/* 10 Read-Only Requirements Grid (Section 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5 text-xs font-mono">
        
        {/* 1. Daily Load */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Daily Load</span>
          <div className="text-sm font-bold text-white light:text-slate-900 mt-0.5 truncate">
            {results.dailyKwh} <span className="text-[10px] text-slate-400 font-normal">kWh/d</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">{(results.dailyWh / 1000).toFixed(3)} kWh</span>
        </div>

        {/* 2. PV Requirement */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">PV Requirement</span>
          <div className="text-sm font-bold text-emerald-400 light:text-emerald-600 mt-0.5 truncate">
            {(results.requiredArrayW / 1000).toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kW</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">{(results.actualArrayWatts / 1000).toFixed(1)} kW installed</span>
        </div>

        {/* 3. Battery Requirement */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Battery Req</span>
          <div className="text-sm font-bold text-teal-400 light:text-teal-600 mt-0.5 truncate">
            {results.requiredNominalBatteryKwh.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kWh</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">Nominal storage</span>
        </div>

        {/* 4. Usable Storage */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Usable Storage</span>
          <div className="text-sm font-bold text-teal-300 light:text-teal-700 mt-0.5 truncate">
            {results.installedUsableBatteryKwh.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kWh</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">{Math.round(results.batteryDoD * 100)}% max DoD</span>
        </div>

        {/* 5. Continuous Inverter */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Continuous Inv</span>
          <div className="text-sm font-bold text-white light:text-slate-900 mt-0.5 truncate">
            {results.continuousRequirementKw.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kW</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">Peak: {(results.peakContinuousW / 1000).toFixed(1)} kW</span>
        </div>

        {/* 6. Calculated Surge */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Calculated Surge</span>
          <div className="text-sm font-bold text-amber-400 light:text-amber-600 mt-0.5 truncate">
            {results.surgeRequirementKw.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">kW</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">{results.inverterSurgeDurationSec || 5}s duration</span>
        </div>

        {/* 7. Battery System */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Battery System</span>
          <div className="text-sm font-bold text-sky-400 light:text-sky-600 mt-0.5 truncate">
            {results.systemVoltage}V <span className="text-[10px] text-slate-400 font-normal">class</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">{results.batteryCount} units bank</span>
        </div>

        {/* 8. Required MPPT Current */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Required MPPT</span>
          <div className="text-sm font-bold text-cyan-400 light:text-cyan-600 mt-0.5 truncate">
            {results.requiredMpptCurrentA.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">A</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">125% NEC safety</span>
        </div>

        {/* 9. Target Autonomy */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Target Autonomy</span>
          <div className="text-sm font-bold text-white light:text-slate-900 mt-0.5 truncate">
            {results.targetAutonomyDays.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">day</span>
          </div>
          <span className="text-[9px] text-slate-500 block truncate">User slider</span>
        </div>

        {/* 10. Actual Designed Autonomy */}
        <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase block truncate">Actual Autonomy</span>
          <div className="text-sm font-bold text-emerald-400 light:text-emerald-600 mt-0.5 truncate">
            {results.actualAutonomyDays.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">days</span>
          </div>
          <span className="text-[9px] text-emerald-400/80 block truncate">
            {results.actualAutonomyDays >= results.targetAutonomyDays ? '✓ Meets target' : '⚠ Below target'}
          </span>
        </div>

      </div>

    </div>
  );
};
