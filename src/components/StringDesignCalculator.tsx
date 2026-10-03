import React, { useState } from 'react';
import { Network, AlertOctagon, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { StringDesignConfig, MPPTConfig, StringDesignResult } from '../types/solar';
import { Translations } from '../lib/translations';
import { Tooltip } from './Tooltip';

interface StringDesignCalculatorProps {
  stringConfig: StringDesignConfig;
  onUpdateStringConfig: (cfg: StringDesignConfig) => void;
  mpptConfig: MPPTConfig;
  totalPanels: number;
  result?: StringDesignResult;
  t: Translations;
}

export const StringDesignCalculator: React.FC<StringDesignCalculatorProps> = ({
  stringConfig,
  onUpdateStringConfig,
  mpptConfig,
  totalPanels,
  result,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!result) return null;

  const handleField = (field: keyof StringDesignConfig, val: number) => {
    onUpdateStringConfig({
      ...stringConfig,
      [field]: val,
      hasSpecs: true,
    });
  };

  const getBadge = () => {
    if (!result.hasSpecs) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
          Validation Pending
        </span>
      );
    }
    if (result.isVocSafe && result.isVmpInRange && result.isCurrentSafe) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Safe Configuration
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
        Review Limits
      </span>
    );
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
            {t.stringDesign}
          </h3>
          {getBadge()}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-slate-400 w-full sm:w-auto">
          <span className="truncate">{result.parallelStrings} strings × {result.panelsPerString} panels ({result.totalPanelsUsed} total)</span>
          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 light:border-slate-100 space-y-4 text-xs">
          <p className="text-slate-400 text-xs leading-relaxed">
            Verifies string cold-temperature Voc against MPPT maximum input voltage to prevent inverter destruction, and hot summer Vmp against minimum MPPT tracking limits.
          </p>

          {/* Module Electrical Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">
                <Tooltip term={t.vocSTC} content="Open-circuit voltage measured at Standard Test Conditions (25°C, 1000 W/m²)." />
              </span>
              <input
                type="number"
                step="0.1"
                value={stringConfig.panelVoc}
                onChange={(e) => handleField('panelVoc', parseFloat(e.target.value) || 45)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">
                <Tooltip term={t.vmpSTC} content="Maximum power voltage where panel delivers peak watts at STC." />
              </span>
              <input
                type="number"
                step="0.1"
                value={stringConfig.panelVmp}
                onChange={(e) => handleField('panelVmp', parseFloat(e.target.value) || 38)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">
                <Tooltip term={t.iscSTC} content="Short-circuit current at STC." />
              </span>
              <input
                type="number"
                step="0.1"
                value={stringConfig.panelIsc}
                onChange={(e) => handleField('panelIsc', parseFloat(e.target.value) || 10)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">
                <Tooltip term="Temp Coeff (%/°C)" content="Negative voltage temperature coefficient. Panel voltage increases as ambient temperature drops." />
              </span>
              <input
                type="number"
                step="0.01"
                value={stringConfig.tempCoeffVoc}
                onChange={(e) => handleField('tempCoeffVoc', parseFloat(e.target.value) || -0.28)}
                className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Results Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-[#0b1329] light:bg-slate-100 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">SERIES PANELS / STRING</span>
              <span className="font-mono font-bold text-white light:text-slate-900 text-sm">
                {result.panelsPerString} in series
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0b1329] light:bg-slate-100 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">PARALLEL STRINGS</span>
              <span className="font-mono font-bold text-white light:text-slate-900 text-sm">
                {result.parallelStrings} strings
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0b1329] light:bg-slate-100 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">COLD VOC (MAX PV)</span>
              <span className={`font-mono font-bold text-sm ${result.isVocSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.stringVocCold} V
              </span>
              <span className="text-[10px] text-slate-400 block">MPPT Limit: {mpptConfig.maxPvVoc} V</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0b1329] light:bg-slate-100 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">HOT VMP (MIN PV)</span>
              <span className={`font-mono font-bold text-sm ${result.isVmpInRange ? 'text-emerald-400' : 'text-amber-400'}`}>
                {result.stringVmpHot} V
              </span>
              <span className="text-[10px] text-slate-400 block">MPPT Min: {mpptConfig.mpptVmin} V</span>
            </div>
          </div>

          {/* Warnings / Safety Status Banner */}
          {result.warnings.length > 0 ? (
            <div className="space-y-1.5">
              {result.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          ) : !result.hasSpecs ? (
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/60 text-blue-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Electrical string validation unavailable — enter panel and MPPT specifications to verify voltages.</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{result.statusMessage} — Cold Voc ({result.stringVocCold}V) is safely below the {mpptConfig.maxPvVoc}V limit. Hot Vmp ({result.stringVmpHot}V) is within tracking window.</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
