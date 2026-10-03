import React from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  DollarSign,
  Info
} from 'lucide-react';
import { CalculationResults, CostConfig } from '../types/solar';
import { Translations } from '../lib/translations';

interface SystemOverviewProps {
  results: CalculationResults;
  costs: CostConfig;
  t: Translations;
  onOpenAudit?: (auditKey: string) => void;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  results,
  costs,
  t,
  onOpenAudit,
}) => {
  const currencySymbol = costs.currency === 'EUR' ? '€' : costs.currency === 'XOF' ? 'FCFA ' : '$';

  const formatCost = (val: number) => {
    return new Intl.NumberFormat().format(val);
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-xl mb-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3.5 sm:mb-4 border-b border-slate-800/80 light:border-slate-100 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-bold tracking-wider uppercase text-emerald-400 light:text-emerald-600">
            {t.systemOverview}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 light:text-slate-500">
            Single Source of Truth · Audited Engine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        
        {/* Metric 1: Total Load */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.totalLoad}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('load')}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-white light:text-slate-900 tracking-tight">
              {results.dailyKwh} <span className="text-xs font-normal text-slate-400">kWh/d</span>
            </div>
            <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5 truncate">
              Day: {results.daytimeKwh}k · Night: {results.nighttimeKwh}k
            </div>
          </div>
        </div>

        {/* Metric 2: Solar Array */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.solarArray}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('solar')}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-emerald-400 light:text-emerald-600 tracking-tight">
              {(results.actualArrayWatts / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-300 light:text-slate-600 font-mono mt-0.5 truncate">
              {results.panelCount} × {results.panelWattage}W {results.stringDesign ? `(${results.stringDesign.parallelStrings}×${results.stringDesign.panelsPerString})` : ''}
            </div>
            <div className="hidden sm:block text-[10px] text-emerald-400/90 font-mono mt-0.5 truncate">
              +{results.actualInstalledSolarMargin}% mgn (+{results.designReserveMargin}% req)
            </div>
          </div>
        </div>

        {/* Metric 3: Battery Bank */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.batteryBank}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('battery')}
                  className="text-slate-500 hover:text-teal-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-teal-400 light:text-teal-600 tracking-tight">
              {results.installedNominalBatteryKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[11px] text-slate-300 light:text-slate-600 font-mono mt-0.5 truncate">
              {results.batteryCount} × {results.batteryUnitNominalKwh} kWh
            </div>
            <div className="hidden sm:block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              Usable: <strong className="text-slate-200 light:text-slate-700">{results.installedUsableBatteryKwh}k</strong> · Auto: <strong className="text-teal-400">{results.actualAutonomyDays}d</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Inverter */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.inverter}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('inverter')}
                  className="text-slate-500 hover:text-blue-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-white light:text-slate-900 tracking-tight">
              {results.selectedInverterKw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5 truncate">
              Cont: {(results.peakSimultaneousW / 1000).toFixed(1)} kW
            </div>
            <div className="hidden sm:block text-[10px] text-amber-400 font-mono mt-0.5 truncate">
              Surge: {results.inverterSurgeRatingKw} kW ({results.surgeRequirementKw}k req)
            </div>
          </div>
        </div>

        {/* Metric 5: MPPT */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.mppt}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('mppt')}
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-white light:text-slate-900 tracking-tight">
              {results.mpptUnitsCount} × {results.mpptUnitRatingA}A
            </div>
            <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5 truncate">
              Req: {results.requiredMpptCurrentA} A (NEC)
            </div>
            <div className="hidden sm:block text-[10px] text-cyan-400 font-mono mt-0.5 truncate">
              Headroom: {results.mpptHeadroomA > 0 ? `+${results.mpptHeadroomA}` : results.mpptHeadroomA} A
            </div>
          </div>
        </div>

        {/* Metric 6: Autonomy */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between relative group min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.autonomy}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('autonomy')}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  title="View calculation formula & audit trail"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-white light:text-slate-900 tracking-tight">
              {results.actualAutonomyDays.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">
                {results.actualAutonomyDays === 1 ? t.day : t.days}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5 truncate">
              Target: <strong className="text-slate-200 light:text-slate-700">{results.effectiveTargetAutonomyDays.toFixed(1)}d</strong>
            </div>
            <div className={`hidden sm:block text-[10px] font-mono mt-0.5 truncate ${results.isAutonomySufficient ? 'text-emerald-400' : 'text-amber-400'}`}>
              {results.isAutonomySufficient ? '✓ Target Achieved' : `⚠ Deficit: +${results.batteryDeficitCount} batt`}
            </div>
          </div>
        </div>

        {/* Metric 7: Estimated Cost */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between col-span-2 md:col-span-4 xl:col-span-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-500 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate">{t.estimatedCost}</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-xl lg:text-2xl font-bold font-mono text-emerald-400 light:text-emerald-600 tracking-tight truncate">
              {currencySymbol}{formatCost(results.costs.grandTotal)}
            </div>
            <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5 truncate">
              Equip: {currencySymbol}{formatCost(results.costs.equipmentSubtotal)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
