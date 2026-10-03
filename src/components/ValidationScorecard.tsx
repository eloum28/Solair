import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, Clock, Check } from 'lucide-react';
import { ValidationScorecardItem, CategoryValidationStatus } from '../types/equipment';

interface ValidationScorecardProps {
  scorecard: ValidationScorecardItem[];
  systemValidationLevel: 'FULLY_VALIDATED' | 'PARTIALLY_VALIDATED' | 'INVALID_CONFIGURATION';
  compatibilityWarnings: string[];
  unverifiedItems: string[];
}

export const ValidationScorecard: React.FC<ValidationScorecardProps> = ({
  scorecard,
  systemValidationLevel,
  compatibilityWarnings,
  unverifiedItems,
}) => {
  const getCategoryBadge = (status: CategoryValidationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED</span>
          </span>
        );
      case 'NOT_YET_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>NOT YET VERIFIED</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>MARGINAL / WARNING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      
      {/* System Overall Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Professional Validation Scorecard</span>
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Strict engineering category audit — no unverified assumptions or generic percentages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">System Level:</span>
          {systemValidationLevel === 'FULLY_VALIDATED' && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md">
              <Check className="w-4 h-4" />
              <span>FULLY VALIDATED</span>
            </div>
          )}
          {systemValidationLevel === 'PARTIALLY_VALIDATED' && (
            <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/40 text-sky-400 font-bold font-mono text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>PARTIALLY VALIDATED</span>
            </div>
          )}
          {systemValidationLevel === 'INVALID_CONFIGURATION' && (
            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold font-mono text-xs flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-4 h-4" />
              <span>INVALID CONFIGURATION</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Audit Checklist (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {scorecard.map((sc) => (
          <div
            key={sc.category}
            className="p-3 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1">
              <span className="text-xs font-bold font-mono text-slate-200 light:text-slate-800">
                {sc.category}
              </span>
              {getCategoryBadge(sc.status)}
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 font-sans mt-0.5">
              {sc.details}
            </p>
          </div>
        ))}
      </div>

      {/* Compatibility Warnings (Section 14) */}
      {compatibilityWarnings.length > 0 && (
        <div className="mb-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
          <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5 uppercase font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Equipment Compatibility & Configuration Warnings ({compatibilityWarnings.length})</span>
          </span>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 light:text-slate-700">
            {compatibilityWarnings.map((warn, idx) => (
              <li key={idx} className="leading-relaxed">
                {warn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unverified Items Notice (Section 15, 16) */}
      {unverifiedItems.length > 0 && (
        <div className="p-3 rounded-xl bg-[#0b1329]/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>
              Pending Manufacturer Datasheet Attachments: <strong className="text-slate-300">{unverifiedItems.join(', ')}</strong>
            </span>
          </div>
          <span className="text-slate-500 italic">
            Full validation requires verified cut sheets.
          </span>
        </div>
      )}

    </div>
  );
};
