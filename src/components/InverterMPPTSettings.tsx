import React from 'react';
import { Cpu, Sliders, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { InverterConfig, MPPTConfig, CalculationResults } from '../types/solar';
import { STANDARD_INVERTER_SIZES_KW } from '../lib/solarCalculations';
import { Translations } from '../lib/translations';
import { Tooltip } from './Tooltip';

interface InverterMPPTSettingsProps {
  inverter: InverterConfig;
  onUpdateInverter: (inv: InverterConfig) => void;
  mppt: MPPTConfig;
  onUpdateMPPT: (mppt: MPPTConfig) => void;
  results: CalculationResults;
  t: Translations;
  onOpenAudit?: (auditKey: string) => void;
}

export const InverterMPPTSettings: React.FC<InverterMPPTSettingsProps> = ({
  inverter,
  onUpdateInverter,
  mppt,
  onUpdateMPPT,
  results,
  t,
  onOpenAudit,
}) => {
  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
            {t.powerConversion}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => onOpenAudit('inverter')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Audit Inverter</span>
            </button>
          )}
          <span className="text-xs font-mono text-blue-400 font-semibold">
            {results.selectedInverterKw} kW Inverter · {results.mpptUnitsCount} × {results.mpptUnitRatingA}A MPPT
          </span>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Inverter Sizing Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 light:text-slate-700 font-semibold">
              {t.recommendedInverter}
            </span>
            <span className="font-mono text-xs text-blue-400 font-bold">
              Min Recommended: {results.recommendedInverterKw} kW
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 mb-2.5">
            <div>
              <span className="text-[11px] text-slate-400 block">{t.continuousPower}</span>
              <span className="font-mono font-bold text-white light:text-slate-900 text-sm">
                {(results.peakSimultaneousW / 1000).toFixed(2)} kW
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Req (+{Math.round(inverter.headroom * 100)}%): <strong>{results.continuousRequirementKw} kW</strong>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{t.peakSurgePower}</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {results.surgeRequirementKw} kW
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Inrush motor surge
              </span>
            </div>
          </div>

          {/* Inverter Continuous & Documented Surge Fields (Requirement 11) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Continuous Rating</span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs bg-[#0b1329] light:bg-white border border-slate-700 rounded px-2 py-1.5 text-white light:text-slate-900">
                <span>{results.inverterContinuousRatingKw} kW</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Documented Surge</span>
              <input
                type="number"
                step="0.5"
                value={inverter.surgeRatingKw !== undefined ? inverter.surgeRatingKw : results.inverterContinuousRatingKw * 2.0}
                onChange={(e) => onUpdateInverter({ ...inverter, surgeRatingKw: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Surge Duration</span>
              <input
                type="number"
                step="1"
                value={inverter.surgeDurationSec || 5}
                onChange={(e) => onUpdateInverter({ ...inverter, surgeDurationSec: parseInt(e.target.value) || 5 })}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Inverter Headroom Slider */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">
                <Tooltip term={t.inverterHeadroom} content={t.inverterHeadroomHelp} />
              </span>
              <span className="font-mono text-blue-400 font-semibold">
                +{Math.round(inverter.headroom * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={Math.round(inverter.headroom * 100)}
              onChange={(e) => onUpdateInverter({ ...inverter, headroom: parseInt(e.target.value) / 100 })}
              className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Standard Size Quick Selector */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">
              Select Commercial Inverter Size:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
              {STANDARD_INVERTER_SIZES_KW.slice(0, 8).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateInverter({ ...inverter, selectedSizeKw: size, surgeRatingKw: size * 2.0 })}
                  className={`py-1.5 px-1 rounded-lg text-center font-mono font-semibold transition-all border text-xs ${
                    results.selectedInverterKw === size
                      ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-[#0b1329] light:bg-slate-50 border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
                  }`}
                >
                  {size} kW
                </button>
              ))}
            </div>
          </div>

          {/* Inverter Compatibility Status */}
          <div className="mt-2 space-y-1">
            {!results.isContinuousAdequate && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Inverter continuous rating ({results.inverterContinuousRatingKw} kW) is undersized for design load ({results.continuousRequirementKw} kW).</span>
              </div>
            )}

            {!results.isSurgeAdequate && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Documented surge rating ({results.inverterSurgeRatingKw} kW) is insufficient for motor starting peak ({results.surgeRequirementKw} kW).</span>
              </div>
            )}

            {!results.isSurgeVerified && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>⚠ Surge compatibility not verified with manufacturer datasheet.</span>
              </div>
            )}

            {results.isContinuousAdequate && results.isSurgeAdequate && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Inverter continuous ({results.inverterContinuousRatingKw} kW) and surge ({results.inverterSurgeRatingKw} kW) satisfy calculated load demands.</span>
              </div>
            )}

            {/* Manufacturer Datasheet Verification Toggle */}
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0b1329]/80 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 cursor-pointer mt-1 text-[11px]">
              <input
                type="checkbox"
                checked={Boolean(inverter.isManufacturerVerified)}
                onChange={(e) => onUpdateInverter({ ...inverter, isManufacturerVerified: e.target.checked })}
                className="accent-blue-500 w-3.5 h-3.5 rounded"
              />
              <span className="text-slate-300 light:text-slate-700">
                <strong>Inverter Datasheet Verified:</strong> Ratings cross-checked against manufacturer cut sheet (Required for <span className="text-emerald-400">WELL SIZED — VERIFIED</span> status).
              </span>
            </label>
          </div>
        </div>

        {/* MPPT Controller Sizing Section (Requirement 12) */}
        <div className="border-t border-slate-800/80 light:border-slate-200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 light:text-slate-700 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <Tooltip term={t.mpptSizing} content="Maximum Power Point Tracker steps high voltage DC down to battery charging with 125% NEC cold weather factor." />
            </span>
            <div className="flex items-center gap-2">
              {onOpenAudit && (
                <button
                  type="button"
                  onClick={() => onOpenAudit('mppt')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Audit MPPT</span>
                </button>
              )}
              <span className="font-mono text-cyan-400 font-bold">
                {results.mpptUnitsCount} × {results.mpptUnitRatingA}A
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 mb-2 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Required (NEC)</span>
              <span className="font-bold text-white light:text-slate-900 text-sm">
                {results.requiredMpptCurrentA} A
              </span>
              <span className="text-[10px] text-slate-400 block">125% safety</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Installed</span>
              <span className="font-bold text-cyan-400 text-sm">
                {results.installedMpptCurrentA} A
              </span>
              <span className="text-[10px] text-slate-400 block">Total capacity</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Headroom</span>
              <span className={`font-bold text-sm ${results.mpptHeadroomA >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {results.mpptHeadroomA >= 0 ? `+${results.mpptHeadroomA}` : results.mpptHeadroomA} A
              </span>
              <span className="text-[10px] text-slate-400 block">Reserve current</span>
            </div>
          </div>

          {/* MPPT Rating Selector */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-slate-400">{t.mpptUnitRating}:</span>
            <div className="flex gap-1.5">
              {[60, 80, 100].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onUpdateMPPT({ ...mppt, ratedCurrentA: rating })}
                  className={`px-3 py-1 rounded font-mono text-xs border ${
                    mppt.ratedCurrentA === rating
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-[#0b1329] light:bg-slate-50 border-slate-700 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
                  }`}
                >
                  {rating}A
                </button>
              ))}
            </div>
          </div>

          {/* MPPT Datasheet Verification Toggle */}
          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0b1329]/80 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={Boolean(mppt.isManufacturerVerified)}
              onChange={(e) => onUpdateMPPT({ ...mppt, isManufacturerVerified: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5 rounded"
            />
            <span className="text-slate-300 light:text-slate-700">
              <strong>MPPT Datasheet Verified:</strong> Voc limit ({mppt.maxPvVoc}V) and tracking ranges cross-checked against manufacturer cut sheet.
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};
