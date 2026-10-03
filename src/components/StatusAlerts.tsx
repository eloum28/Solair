import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { CalculationResults } from '../types/solar';
import { Translations } from '../lib/translations';

interface StatusAlertsProps {
  results: CalculationResults;
  t: Translations;
  onNavigateToValidation?: () => void;
}

export const StatusAlerts: React.FC<StatusAlertsProps> = ({ results, t, onNavigateToValidation }) => {
  const { status, warnings } = results;

  const getStatusBadge = () => {
    switch (status) {
      case 'WELL_SIZED_VERIFIED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>WELL SIZED — VERIFIED</span>
          </div>
        );
      case 'WELL_SIZED_PENDING':
        return (
          <button
            type="button"
            onClick={onNavigateToValidation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold text-xs font-mono transition-colors text-left cursor-pointer"
            title="Click to route to Professional Validation workspace"
          >
            <Info className="w-3.5 h-3.5 shrink-0 text-sky-400" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
              <span>WELL SIZED</span>
              <span className="text-amber-400 underline decoration-dotted sm:before:content-['—_']">
                MANUFACTURER VERIFICATION PENDING →
              </span>
            </div>
          </button>
        );
      case 'MARGINAL':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>MARGINAL SYSTEM CAPACITY</span>
          </div>
        );
      case 'UNDERSIZED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs font-mono">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span>UNDERSIZED CAPACITY DEFICIT</span>
          </div>
        );
      case 'INVALID_CONFIGURATION':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs font-mono shadow-md animate-pulse">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>INVALID CONFIGURATION</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-md mb-6 transition-colors">
      
      {/* MOBILE ONLY CARD (< sm): Vertically organized per Requirement 4 */}
      <div className="sm:hidden space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 light:text-slate-500 font-bold">
            ENGINEERING STATUS
          </span>
          <div className="text-xs">
            {getStatusBadge()}
          </div>
        </div>

        <div className="bg-[#0b1329]/80 light:bg-slate-50 p-3.5 rounded-xl border border-slate-800 light:border-slate-200 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-200 pb-2">
            <span className="text-slate-400 light:text-slate-600">Manufacturer verification:</span>
            <span className={status === 'WELL_SIZED_VERIFIED' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {status === 'WELL_SIZED_VERIFIED' ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-200 pb-2">
            <span className="text-slate-400 light:text-slate-600">Solar margin:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {results.actualInstalledSolarMargin > 0 ? `+${results.actualInstalledSolarMargin}%` : `${results.actualInstalledSolarMargin}%`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Actual autonomy:</span>
            <span className={`font-bold text-sm ${results.isAutonomySufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.actualAutonomyDays} days
            </span>
          </div>
        </div>

        {onNavigateToValidation && (
          <button
            type="button"
            onClick={onNavigateToValidation}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/15 to-cyan-500/15 hover:from-sky-500/25 hover:to-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Complete Professional Validation</span>
            <ArrowRight className="w-4 h-4 shrink-0 text-cyan-400" />
          </button>
        )}
      </div>

      {/* DESKTOP & TABLET BAR (>= sm) */}
      <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 light:text-slate-500">
            {t.systemStatus}:
          </span>
          {getStatusBadge()}
        </div>
        <div className="text-[11px] sm:text-xs font-mono text-slate-400 light:text-slate-500 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-3 gap-y-1.5 bg-[#0b1329]/60 light:bg-slate-50 p-2 sm:p-0 rounded-lg sm:bg-transparent">
          <span>
            Design Reserve: <strong className="text-slate-200 light:text-slate-700">+{results.designReserveMargin}%</strong>
          </span>
          <span>
            Actual Margin:{' '}
            <strong className={results.actualInstalledSolarMargin >= 10 ? 'text-emerald-400' : 'text-amber-400'}>
              {results.actualInstalledSolarMargin > 0 ? `+${results.actualInstalledSolarMargin}%` : `${results.actualInstalledSolarMargin}%`}
            </strong>
          </span>
          <span>
            Actual Autonomy:{' '}
            <strong className={results.isAutonomySufficient ? 'text-emerald-400' : 'text-rose-400'}>
              {results.actualAutonomyDays}d
            </strong>{' '}
            <span className="text-slate-500">({results.effectiveTargetAutonomyDays}d req)</span>
          </span>
          <span>
            Min SOC:{' '}
            <strong className={results.isBatterySufficientForNight ? 'text-emerald-400' : 'text-rose-400'}>
              {results.minSocReached}%
            </strong>
          </span>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="space-y-2 mt-2">
          {warnings.map((w) => (
            <div
              key={w.id}
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                w.severity === 'danger'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : w.severity === 'warning'
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  : 'bg-blue-950/30 border-blue-800/60 text-blue-200'
              }`}
            >
              {w.severity === 'danger' ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : w.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{w.title}</div>
                <div className="text-slate-300 dark:text-slate-300 light:text-slate-700 mt-0.5 leading-relaxed">
                  {w.message}
                </div>
                {w.actionableRecommendation && (
                  <div className="mt-1.5 flex items-center gap-1.5 font-medium text-emerald-400 light:text-emerald-600 bg-black/20 dark:bg-black/20 light:bg-emerald-50 px-2 py-1 rounded">
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>{w.actionableRecommendation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-2 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>All electrical and thermal safety checks pass. Solar generation, battery storage, and inverter capacity are balanced.</span>
        </div>
      )}
    </div>
  );
};
