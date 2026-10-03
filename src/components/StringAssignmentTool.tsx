import React, { useState } from 'react';
import { 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Sun, 
  ThermometerSnowflake, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { StringAllocation, MpptTrackerValidation, SolarPanel, Inverter, MPPTController } from '../types/equipment';
import { CalculationResults, LocationConfig } from '../types/solar';

interface StringAssignmentToolProps {
  allocations: StringAllocation[];
  trackers: MpptTrackerValidation[];
  panel: SolarPanel;
  inverter: Inverter;
  mppt: MPPTController;
  results: CalculationResults;
  location: LocationConfig;
  designMinTempC?: number;
  onUpdateDesignMinTemp?: (tempC: number) => void;
  onUpdateStringAssignment?: (stringIndex: number, mpptIndex: number, trackerIndex: number) => void;
}

export const StringAssignmentTool: React.FC<StringAssignmentToolProps> = ({
  allocations,
  trackers,
  panel,
  inverter,
  mppt,
  results,
  location,
  designMinTempC = 15,
  onUpdateDesignMinTemp,
  onUpdateStringAssignment,
}) => {
  const mpptCount = Math.max(1, results.mpptUnitsCount);
  const totalPanels = results.panelCount;
  const panelsPerString = results.stringDesign?.panelsPerString || 5;

  const effectiveMaxVoc = inverter.isHybrid && inverter.maxPvVoc ? inverter.maxPvVoc : mppt.maxPvVoc || 250;

  // Temperature correction calculation (Section 14)
  const coeff = Math.abs(panel.tempCoeffVoc / 100);
  const deltaT = Math.max(0, 25 - designMinTempC);
  const tempCorrectionFactor = coeff * deltaT;
  const singlePanelColdVoc = panel.voc * (1 + tempCorrectionFactor);
  const stringColdVoc = Number((singlePanelColdVoc * panelsPerString).toFixed(1));
  const stringStcVoc = Number((panel.voc * panelsPerString).toFixed(1));
  const voltageCorrectionDelta = Number((stringColdVoc - stringStcVoc).toFixed(1));
  const voltageMargin = Number((effectiveMaxVoc - stringColdVoc).toFixed(1));

  // Build visual MPPT assignments mapping list (Section 12)
  const mpptMapping: Record<number, number[]> = {};
  for (let m = 1; m <= mpptCount; m++) {
    mpptMapping[m] = [];
  }
  for (const str of allocations) {
    if (!mpptMapping[str.assignedMpptIndex]) {
      mpptMapping[str.assignedMpptIndex] = [];
    }
    mpptMapping[str.assignedMpptIndex].push(str.stringIndex);
  }

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
              PV String Workspace & MPPT Assignment
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Graphical string layout, cold-weather Voc temperature correction, and controller tracking validation.
            </p>
          </div>
        </div>
        <div className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          PV ARRAY: {totalPanels} × {panel.ratedPowerW}W ({(results.actualArrayWatts / 1000).toFixed(2)} kW total)
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 14: DESIGN MINIMUM TEMPERATURE & VOC CORRECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-5 p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 light:text-slate-800 uppercase font-mono">
              Design Minimum Temperature & Cold Voc Correction
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Design Min Temp:</span>
            <input
              type="number"
              min="-40"
              max="30"
              value={designMinTempC}
              onChange={(e) => onUpdateDesignMinTemp && onUpdateDesignMinTemp(Number(e.target.value))}
              className="w-16 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2 py-0.5 text-center font-mono text-cyan-400 font-bold"
            />
            <span className="text-slate-400 font-mono text-[11px]">°C</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-[#111e38]/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">String Voc @ STC (25°C)</span>
            <span className="text-white font-bold">{stringStcVoc} V</span>
          </div>
          <div className="p-2 rounded-lg bg-[#111e38]/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Temperature Correction</span>
            <span className="text-cyan-400 font-bold">+{voltageCorrectionDelta} V ({panel.tempCoeffVoc}%/°C)</span>
          </div>
          <div className="p-2 rounded-lg bg-[#111e38]/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Corrected Max Voc</span>
            <span className="text-cyan-300 font-bold">{stringColdVoc} V (at {designMinTempC}°C)</span>
          </div>
          <div className="p-2 rounded-lg bg-[#111e38]/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">MPPT Max Voltage</span>
            <span className="text-amber-400 font-bold">{effectiveMaxVoc} V</span>
          </div>
          <div className="p-2 rounded-lg bg-[#111e38]/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Voltage Margin</span>
            <span className={voltageMargin >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {voltageMargin >= 0 ? `+${voltageMargin} V Headroom` : `${voltageMargin} V VIOLATION!`}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-2 font-mono">
          * Calculated with authentic panel manufacturer coefficient: Voc_cold = Voc_STC × [1 + |γVoc| × (25°C - Tmin)]. Never uses generic estimates.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 12: GRAPHICAL STRING SECTION & MAPPING SUMMARY */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700 block font-mono">
            1. Graphical PV String Architecture & Module Layout:
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
              <span>Module [P]</span>
            </span>
            <span>Series connection: [P]—[P]—[P]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {allocations.map((str) => {
            const isSafe = str.vocCold <= effectiveMaxVoc;
            return (
              <div
                key={str.stringIndex}
                className="p-3.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-xs"
              >
                {/* String Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                      STRING {str.stringIndex}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {str.panelsCount} × {panel.ratedPowerW}W = {str.watts} W
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isSafe ? 'STATUS: PASS' : 'STATUS: FAIL'}
                  </span>
                </div>

                {/* Visual Module String Row [P][P][P][P][P] */}
                <div className="p-2 rounded-lg bg-[#111e38]/70 border border-slate-800/80 mb-2.5 flex items-center gap-1.5 overflow-x-auto">
                  {Array.from({ length: str.panelsCount }, (_, pIdx) => (
                    <div
                      key={pIdx}
                      className="px-2 py-1 rounded bg-[#0b1329] border border-emerald-500/40 text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 shrink-0 shadow-sm"
                      title={`Panel ${pIdx + 1}: ${panel.ratedPowerW}W STC (${panel.voc}V / ${panel.isc}A)`}
                    >
                      <Sun className="w-2.5 h-2.5" />
                      <span>P{pIdx + 1}</span>
                    </div>
                  ))}
                  <span className="text-[10px] text-slate-500 font-sans ml-1">
                    ({str.panelsCount} in series)
                  </span>
                </div>

                {/* Section 13: String Electrical Values */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Voc STC:</span>
                    <span className="text-slate-200">{str.vocSTC} V</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cold Voc ({designMinTempC}°C):</span>
                    <span className={str.vocCold <= effectiveMaxVoc ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                      {str.vocCold} V
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vmp:</span>
                    <span className="text-slate-200">{str.vmpSTC} V (Hot {str.vmpHot}V)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Imp / Isc:</span>
                    <span className="text-slate-200">{str.imp} A / {str.isc} A</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">MPPT Voltage Limit:</span>
                    <span className="text-amber-400">{effectiveMaxVoc} V max (Headroom: +{(effectiveMaxVoc - str.vocCold).toFixed(1)}V)</span>
                  </div>
                </div>

                {/* Visual String Assignment Selector */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Assigned Controller:</span>
                  <select
                    value={`${str.assignedMpptIndex}-${str.assignedTrackerIndex}`}
                    onChange={(e) => {
                      const [m, trk] = e.target.value.split('-').map(Number);
                      if (onUpdateStringAssignment) {
                        onUpdateStringAssignment(str.stringIndex, m, trk);
                      }
                    }}
                    className="bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2.5 py-1 text-white light:text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-400"
                  >
                    {Array.from({ length: mpptCount }, (_, mIdx) => mIdx + 1).map((mNum) => {
                      const trackersCount = inverter.isHybrid ? (inverter.numberOfMppts || 2) : (mppt.numberOfTrackers || 1);
                      return Array.from({ length: trackersCount }, (_, tIdx) => tIdx + 1).map((tNum) => (
                        <option key={`${mNum}-${tNum}`} value={`${mNum}-${tNum}`}>
                          MPPT {mNum} · Tracker {tNum}
                        </option>
                      ));
                    })}
                  </select>
                </div>

              </div>
            );
          })}
        </div>

        {/* Section 12: Visual MPPT Assignment Summary */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/90 border border-slate-800 text-xs font-mono">
          <span className="text-slate-300 font-bold block mb-2 uppercase text-[11px]">
            Visual MPPT Array Distribution Summary:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(mpptMapping).map(([mNum, strList]) => (
              <div key={mNum} className="p-2.5 rounded-lg bg-[#111e38] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">MPPT {mNum}</span>
                {strList.length > 0 ? (
                  <div className="space-y-0.5 text-[11px]">
                    {strList.map((sIdx) => (
                      <span key={sIdx} className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 mr-1 mb-1">
                        String {sIdx}
                      </span>
                    ))}
                    <div className="text-[10px] text-slate-400 mt-1">
                      {strList.length} Strings ({strList.length * panelsPerString} Panels) · {(strList.length * panelsPerString * panel.ratedPowerW / 1000).toFixed(2)} kW
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 text-[11px] italic">No strings assigned</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MPPT TRACKER ELECTRICAL VALIDATION */}
      {/* ------------------------------------------------------------- */}
      <div>
        <span className="text-xs font-semibold text-slate-300 light:text-slate-700 block mb-2 font-mono">
          2. Controller Electrical Limits & Inrush Current Validation:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trackers.map((tv) => {
            const isAssigned = tv.connectedStringsCount > 0;
            return (
              <div
                key={`mppt-${tv.mpptIndex}-t-${tv.trackerIndex}`}
                className={`p-3.5 rounded-xl border font-mono text-xs transition-colors ${
                  isAssigned
                    ? tv.isVocSafe && tv.isIscSafe
                      ? 'bg-[#0b1329]/90 border-slate-800'
                      : 'bg-rose-950/20 border-rose-800/50'
                    : 'bg-[#0b1329]/40 border-slate-800/50 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                      <Sliders className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-slate-200">
                      MPPT {tv.mpptIndex} · Tracker {tv.trackerIndex}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    !isAssigned
                      ? 'bg-slate-800 text-slate-400'
                      : tv.isVocSafe && tv.isIscSafe
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {!isAssigned ? 'UNASSIGNED' : tv.isVocSafe && tv.isIscSafe ? 'ELECTRICAL PASS' : 'SAFETY VIOLATION'}
                  </span>
                </div>

                {isAssigned ? (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Connected:</span>
                      <span className="text-white font-bold">{tv.connectedStringsCount} Strings ({tv.totalPanels} Panels)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Power:</span>
                      <span className="text-emerald-400 font-bold">{(tv.totalWatts / 1000).toFixed(2)} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Cold Voc:</span>
                      <span className={tv.isVocSafe ? 'text-cyan-400' : 'text-rose-400 font-bold'}>
                        {tv.stringVocCold} V (Headroom: +{tv.headroomVoltageV}V)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Array Current (Isc):</span>
                      <span className={tv.isIscSafe ? 'text-slate-200' : 'text-rose-400 font-bold'}>
                        {tv.totalIsc.toFixed(1)} A
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] italic py-1">
                    No strings assigned to this tracker. Available for future array expansion.
                  </div>
                )}

                {tv.notes.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] space-y-0.5">
                    {tv.notes.map((n, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
