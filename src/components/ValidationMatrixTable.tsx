import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, ShieldCheck } from 'lucide-react';
import { ValidationMatrixItem, ValidationStatus } from '../types/equipment';

interface ValidationMatrixTableProps {
  matrix: ValidationMatrixItem[];
}

export const ValidationMatrixTable: React.FC<ValidationMatrixTableProps> = ({ matrix }) => {
  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PASS</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WARNING</span>
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>FAIL</span>
          </span>
        );
      case 'NOT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>NOT VERIFIED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800/80 light:border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
              System Engineering Validation Matrix
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Cross-reconciliation between calculated requirements and real manufacturer equipment limits.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="text-emerald-400 font-semibold">
            {matrix.filter((m) => m.status === 'PASS').length} Passed
          </span>
          {matrix.filter((m) => m.status === 'WARNING').length > 0 && (
            <span className="text-amber-400 font-semibold">
              {matrix.filter((m) => m.status === 'WARNING').length} Warning
            </span>
          )}
          {matrix.filter((m) => m.status === 'FAIL').length > 0 && (
            <span className="text-rose-400 font-bold">
              {matrix.filter((m) => m.status === 'FAIL').length} Failed
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 light:border-slate-200 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-[#0b1329]/80 light:bg-slate-50">
              <th className="py-2.5 px-3">Validation</th>
              <th className="py-2.5 px-3">Requirement</th>
              <th className="py-2.5 px-3">Equipment</th>
              <th className="py-2.5 px-3">Margin</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 light:divide-slate-100">
            {matrix.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-200 light:text-slate-800">
                  <div>{item.checkName}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.engineeringDetails}</div>
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-300 light:text-slate-700 whitespace-nowrap">
                  {item.requirementValue}
                </td>
                <td className="py-2.5 px-3 font-mono font-medium text-white light:text-slate-900 whitespace-nowrap">
                  {item.equipmentValue}
                </td>
                <td className="py-2.5 px-3 font-mono text-xs font-semibold whitespace-nowrap">
                  <span className={item.margin.startsWith('-') || item.margin === 'Mismatch' ? 'text-rose-400' : 'text-emerald-400'}>
                    {item.margin}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
