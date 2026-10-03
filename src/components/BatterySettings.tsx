import React from 'react';
import { BatteryCharging, Shield, Zap, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BatteryConfig, BatteryChemistry, CalculationResults } from '../types/solar';
import { Translations } from '../lib/translations';
import { Tooltip } from './Tooltip';

interface BatterySettingsProps {
  battery: BatteryConfig;
  onUpdateBattery: (battery: BatteryConfig) => void;
  results: CalculationResults;
  t: Translations;
  onOpenAudit?: (auditKey: string) => void;
}

export const BatterySettings: React.FC<BatterySettingsProps> = ({
  battery,
  onUpdateBattery,
  results,
  t,
  onOpenAudit,
}) => {
  const chemistries: BatteryChemistry[] = ['LiFePO4', 'AGM', 'Gel', 'Flooded'];

  const handleChemistryChange = (chem: BatteryChemistry) => {
    let defaultDod = 0.80;
    let unitV = battery.unitVoltage;
    let unitAh = battery.unitAh;
    let unitCost = battery.unitCost;
    let modelName = battery.modelName;

    if (chem === 'LiFePO4') {
      defaultDod = 0.80;
      unitV = 51.2;
      unitAh = 100;
      unitCost = 1450;
      modelName = 'LiFePO4 51.2V 100Ah Server Rack';
    } else {
      defaultDod = 0.50;
      unitV = 12;
      unitAh = 200;
      unitCost = 350;
      modelName = `${chem} Deep Cycle 12V 200Ah`;
    }

    const unitNominalKwh = Number(((unitV * unitAh) / 1000).toFixed(2));

    onUpdateBattery({
      ...battery,
      chemistry: chem,
      dodLimit: defaultDod,
      unitVoltage: unitV,
      unitAh: unitAh,
      unitNominalKwh,
      unitCost,
      modelName,
    });
  };

  const handleVoltageChange = (v: 12 | 24 | 48) => {
    onUpdateBattery({
      ...battery,
      systemVoltage: v,
    });
  };

  const handleUnitSpecChange = (v: number, ah: number, cost: number) => {
    const kwh = Number(((v * ah) / 1000).toFixed(2));
    onUpdateBattery({
      ...battery,
      unitVoltage: v,
      unitAh: ah,
      unitNominalKwh: kwh,
      unitCost: cost,
    });
  };

  const isDodHigh = (battery.chemistry === 'LiFePO4' && battery.dodLimit > 0.85) ||
    (battery.chemistry !== 'LiFePO4' && battery.dodLimit > 0.55);

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
            {t.batteryConfig}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => onOpenAudit('battery')}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Audit Formula</span>
            </button>
          )}
          <span className="text-xs font-mono text-teal-400 font-semibold">
            {results.installedNominalBatteryKwh} kWh Nominal
          </span>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Chemistry Selector */}
        <div>
          <span className="text-slate-300 light:text-slate-700 font-medium block mb-1.5">
            {t.chemistry}
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {chemistries.map((chem) => (
              <button
                key={chem}
                type="button"
                onClick={() => handleChemistryChange(chem)}
                className={`py-1.5 px-2 rounded-lg text-center font-mono font-semibold transition-all text-xs border ${
                  battery.chemistry === chem
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-[#0b1329] light:bg-slate-50 border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646] light:hover:bg-slate-100'
                }`}
              >
                {chem}
              </button>
            ))}
          </div>
        </div>

        {/* System Voltage Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 light:text-slate-700 font-medium">
              <Tooltip term={t.systemVoltage} content="System DC bus voltage. 48V is standard for off-grid houses to keep wire sizes and resistive losses low." />
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {battery.systemVoltage}V DC Bus
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[12, 24, 48].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleVoltageChange(v as 12 | 24 | 48)}
                className={`py-1.5 px-3 rounded-lg text-center font-mono font-bold transition-all text-xs border ${
                  battery.systemVoltage === v
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                    : 'bg-[#0b1329] light:bg-slate-50 border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
                }`}
              >
                {v}V DC
              </button>
            ))}
          </div>
        </div>

        {/* Dual Storage Sizing Synthesis (Requirement 2) */}
        <div className="p-3 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-slate-300 light:text-slate-700 gap-1">
            <span>Sizing Synthesis: Overnight vs Autonomy</span>
            <span className="font-mono text-teal-400">
              Governing: {results.governingBatteryRequirement.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-800 light:border-slate-200">
              <span className="text-slate-400 block text-[10px]">A. Overnight Storage</span>
              <span className="font-bold text-white light:text-slate-900">{results.overnightNominalBatteryKwh} kWh</span>
              <span className="text-[10px] text-slate-400 block">{results.overnightBatteryCount} batteries min</span>
            </div>

            <div className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-800 light:border-slate-200">
              <span className="text-slate-400 block text-[10px]">B. No-Sun Autonomy ({results.effectiveTargetAutonomyDays}d)</span>
              <span className="font-bold text-white light:text-slate-900">{results.autonomyNominalBatteryKwh} kWh</span>
              <span className="text-[10px] text-slate-400 block">{results.autonomyBatteryCount} batteries req</span>
            </div>
          </div>
        </div>

        {/* Battery Unit Specification (Rack or Small) */}
        <div className="p-3 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <span className="text-slate-300 light:text-slate-700 font-semibold truncate">
              Battery Unit Spec ({battery.modelName})
            </span>
            <span className="font-mono text-teal-400 font-semibold shrink-0">
              {results.batteryUnitNominalKwh} kWh / unit
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Unit Voltage</span>
              <input
                type="number"
                step="0.1"
                value={battery.unitVoltage}
                onChange={(e) => handleUnitSpecChange(parseFloat(e.target.value) || 48, battery.unitAh, battery.unitCost)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">{t.unitCapacity}</span>
              <input
                type="number"
                step="5"
                value={battery.unitAh}
                onChange={(e) => handleUnitSpecChange(battery.unitVoltage, parseFloat(e.target.value) || 100, battery.unitCost)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Unit Price ($)</span>
              <input
                type="number"
                step="10"
                value={battery.unitCost}
                onChange={(e) => handleUnitSpecChange(battery.unitVoltage, battery.unitAh, parseFloat(e.target.value) || 1000)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Quick presets for battery models */}
          <div className="flex gap-1.5 text-[10px] text-slate-400 font-mono">
            <button
              type="button"
              onClick={() => handleUnitSpecChange(51.2, 100, 1450)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:text-white hover:bg-slate-700"
            >
              51.2V 100Ah (5.12kWh)
            </button>
            <button
              type="button"
              onClick={() => handleUnitSpecChange(48, 100, 1350)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:text-white hover:bg-slate-700"
            >
              48V 100Ah (4.8kWh)
            </button>
            <button
              type="button"
              onClick={() => handleUnitSpecChange(12, 200, 380)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:text-white hover:bg-slate-700"
            >
              12V 200Ah (2.4kWh)
            </button>
          </div>
        </div>

        {/* Depth of Discharge (DoD) Slider */}
        <div className="p-3 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 light:text-slate-700 font-medium">
              <Tooltip term={t.depthOfDischarge} content={t.dodHelp} />
            </span>
            <span className="font-mono font-bold text-teal-400 text-sm">
              {Math.round(battery.dodLimit * 100)}% DoD
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="95"
            step="5"
            value={Math.round(battery.dodLimit * 100)}
            onChange={(e) => onUpdateBattery({ ...battery, dodLimit: parseInt(e.target.value) / 100 })}
            className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>50% (Lead-Acid Recommended)</span>
            <span>80% (LiFePO4 Recommended)</span>
            <span>90% (Deep Cycling)</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Recommended Reserve Floor: <strong className="text-emerald-400">{results.recommendedMinSocPercent}% SOC</strong></span>
            <span>Critical Reserve: <strong className="text-rose-400">{results.criticalMinSocPercent}% SOC</strong></span>
          </div>

          {isDodHigh && (
            <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Notice: Operating above chemistry recommended DoD accelerates cycle life degradation.</span>
            </div>
          )}
        </div>

        {/* Target Autonomy Slider & Actual Autonomy Display (Requirement 3 & 17) */}
        <div className="p-3 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 light:text-slate-700 font-medium">
              <Tooltip term={t.backupDays} content={t.backupDaysDesc} />
            </span>
            <div className="text-right">
              <span className="font-mono text-xs text-slate-400">Target: </span>
              <span className="font-mono font-bold text-teal-400 text-sm">
                {battery.autonomyDays.toFixed(1)} {battery.autonomyDays === 1 ? t.day : t.days}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
            {t.backupDaysDesc}
          </p>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={battery.autonomyDays}
            onChange={(e) => onUpdateBattery({ ...battery, autonomyDays: parseFloat(e.target.value) })}
            className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>0.5d (Daytime heavy)</span>
            <span>1.0d (Standard Off-Grid)</span>
            <span>3.0d+ (Critical Standalone)</span>
          </div>

          {/* Actual Autonomy Comparison (Requirement 3 & 17) */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 light:border-slate-200 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 light:text-slate-700 font-semibold">
              Actual Delivered Autonomy:
            </span>
            <span className={`font-bold ${results.isAutonomySufficient ? 'text-emerald-400' : 'text-amber-400'}`}>
              {results.actualAutonomyDays} days
            </span>
          </div>

          {!results.isAutonomySufficient && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Battery bank provides only {results.actualAutonomyDays} days autonomy. Target is {results.effectiveTargetAutonomyDays} days. Recommended increase: +{results.batteryDeficitCount} batteries.
              </span>
            </div>
          )}
        </div>

        {/* Battery Sizing Result Summary */}
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-slate-200">
          <div className="flex items-center justify-between font-mono text-xs">
            <span>{t.batteryBank}:</span>
            <span className="font-bold text-teal-400">
              {results.batteryCount} × {battery.modelName}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs mt-1">
            <span>{t.nominalCapacity} / {t.usableCapacity}:</span>
            <span className="text-white light:text-slate-900 font-semibold">
              {results.installedNominalBatteryKwh} kWh / {results.installedUsableBatteryKwh} kWh
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs mt-1 text-slate-400">
            <span>Target: {results.effectiveTargetAutonomyDays}d · Actual:</span>
            <span className="text-emerald-400 font-semibold">{results.actualAutonomyDays} days autonomy</span>
          </div>
        </div>

      </div>
    </div>
  );
};
