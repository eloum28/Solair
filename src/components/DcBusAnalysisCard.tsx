import React from 'react';
import { Zap, BatteryCharging, AlertTriangle, CheckCircle2, Shield, Info } from 'lucide-react';
import { SystemDcBusAnalysis, Battery, Inverter } from '../types/equipment';
import { CalculationResults } from '../types/solar';

interface DcBusAnalysisCardProps {
  busAnalysis: SystemDcBusAnalysis;
  battery: Battery;
  inverter: Inverter;
  results: CalculationResults;
}

export const DcBusAnalysisCard: React.FC<DcBusAnalysisCardProps> = ({
  busAnalysis,
  battery,
  inverter,
  results,
}) => {
  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      
      <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
              DC Bus Current & Battery Power Ampacity Validation
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Rigorous verification that the battery bank can deliver required continuous discharge current to the inverter.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {busAnalysis.isBatteryCurrentSufficient ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>POWER AMPACITY VALIDATED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-bold px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>CURRENT DEFICIT</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        
        {/* Metric 1: Inverter DC Current Demand */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Inverter Full-Load DC Draw
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {busAnalysis.inverterFullLoadDischargeCurrentA} A
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {inverter.continuousOutputPowerKw * 1000}W ÷ ({battery.nominalVoltageV}V × {Math.round(busAnalysis.inverterEfficiencyUsed * 100)}% eff)
          </p>
        </div>

        {/* Metric 2: Battery Bank Supply Capability */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Battery Bank Continuous Supply
          </span>
          <div className="text-xl font-bold font-mono text-teal-400">
            {busAnalysis.batteryBankContinuousDischargeCurrentA} A
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {results.batteryCount} × {battery.maxContinuousDischargeCurrentA}A (with 0.95 parallel bus factor)
          </p>
        </div>

        {/* Metric 3: Engineering Safety Margin */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Discharge Headroom Margin
          </span>
          <div className={`text-xl font-bold font-mono ${busAnalysis.isBatteryCurrentSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
            +{busAnalysis.batteryCurrentHeadroomA} A ({busAnalysis.batteryCurrentMarginPercent > 0 ? `+${busAnalysis.batteryCurrentMarginPercent}%` : `${busAnalysis.batteryCurrentMarginPercent}%`})
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {busAnalysis.isBatteryCurrentSufficient ? '✓ Thermal safety headroom satisfied.' : '⚠ Battery bank cannot supply inverter draw!'}
          </p>
        </div>

      </div>

      {/* DC Bus Conductor & Protection Sizing Insights (Section 12) */}
      <div className="p-3.5 rounded-xl bg-[#0b1329]/50 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>DC Main Busbar Sizing Baseline (NEC Section 690 / IEEE 1375)</span>
          </span>
          <span className="text-blue-400 font-bold">
            Worst-Case Bus Current: {busAnalysis.combinedWorstCaseBusCurrentA} A
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
          <div>
            <span className="block text-slate-500">Max Inverter Discharge:</span>
            <span className="text-white font-bold">{busAnalysis.inverterFullLoadDischargeCurrentA} A DC</span>
          </div>
          <div>
            <span className="block text-slate-500">Max Solar Charge Injection:</span>
            <span className="text-white font-bold">{busAnalysis.maxSolarChargingCurrentA} A DC</span>
          </div>
          <div>
            <span className="block text-slate-500">Min Recommended Bus Ampacity:</span>
            <span className="text-emerald-400 font-bold">{busAnalysis.recommendedMinimumBusbarAmpacityA} A (125% continuous)</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-sans">
          * Conductor sizes and fuse/breaker trip ratings will be finalized in the electrical protection schedule based on cable run length, ambient temperature derating, and conductor bundling factors.
        </div>
      </div>

    </div>
  );
};
