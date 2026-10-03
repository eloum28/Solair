import React from 'react';
import { X, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuditItem } from '../types/solar';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditItem?: AuditItem;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  auditItem,
}) => {
  if (!isOpen || !auditItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
              {auditItem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formula Box */}
        <div className="p-3 rounded-xl bg-[#0b1329] light:bg-slate-50 border border-slate-800 light:border-slate-200 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Governing Engineering Formula:
          </span>
          <code className="text-xs font-mono font-semibold text-emerald-400 light:text-emerald-600 block leading-relaxed">
            {auditItem.formula}
          </code>
        </div>

        {/* Inputs */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700 block mb-1.5">
            Design Inputs & Assumptions:
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            {auditItem.inputs.map((inp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded bg-[#172646]/50 light:bg-slate-100 text-slate-300 light:text-slate-700"
              >
                <span>{inp.label}:</span>
                <span className="font-semibold text-white light:text-slate-900">{inp.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intermediate Steps */}
        {auditItem.intermediateSteps.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700 block mb-1.5">
              Step-by-Step Derivation:
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {auditItem.intermediateSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded border border-slate-800/80 light:border-slate-200 text-slate-300 light:text-slate-700"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{step.label}</span>
                  </span>
                  <span className="font-semibold text-teal-400 light:text-teal-600">{step.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Result Reconciled */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white light:text-slate-900">Reconciled Output:</span>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-400 light:text-emerald-600">
            {auditItem.result}
          </span>
        </div>

        {/* Close Button */}
        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 font-semibold text-xs transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
