import React, { useState } from 'react';
import { 
  Sun, 
  BatteryCharging, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import { SolarPanel, Battery, Inverter, MPPTController, EquipmentCategory, EquipmentSourceStatus } from '../types/equipment';
import { getAllSolarPanels, getAllBatteries, getAllInverters, getAllMppts } from '../lib/equipmentDatabase';
import { CalculationResults } from '../types/solar';

interface EquipmentSelectionCardsProps {
  panel: SolarPanel;
  battery: Battery;
  inverter: Inverter;
  mppt: MPPTController;
  activeCategory?: EquipmentCategory;
  onSelectCategory?: (category: EquipmentCategory) => void;
  onSelectPanelId: (id: string) => void;
  onSelectBatteryId: (id: string) => void;
  onSelectInverterId: (id: string) => void;
  onSelectMpptId: (id: string) => void;
  onOpenCustomModal: (category: EquipmentCategory) => void;
  customPanels?: SolarPanel[];
  customBatteries?: Battery[];
  customInverters?: Inverter[];
  customMppts?: MPPTController[];
  results: CalculationResults;
}

export const EquipmentSelectionCards: React.FC<EquipmentSelectionCardsProps> = ({
  panel,
  battery,
  inverter,
  mppt,
  activeCategory = 'solar',
  onSelectCategory,
  onSelectPanelId,
  onSelectBatteryId,
  onSelectInverterId,
  onSelectMpptId,
  onOpenCustomModal,
  customPanels,
  customBatteries,
  customInverters,
  customMppts,
  results,
}) => {
  const [activeSpecModal, setActiveSpecModal] = useState<EquipmentCategory | null>(null);

  const panelsList = getAllSolarPanels(customPanels);
  const batteriesList = getAllBatteries(customBatteries);
  const invertersList = getAllInverters(customInverters);
  const mpptsList = getAllMppts(customMppts);

  // Normalize category comparison
  const isPanelActive = activeCategory === 'solar' || activeCategory === 'panel';
  const isBatteryActive = activeCategory === 'battery';
  const isInverterActive = activeCategory === 'inverter';
  const isMpptActive = activeCategory === 'mppt';

  const getStatusBadge = (status: EquipmentSourceStatus) => {
    switch (status) {
      case 'DATASHEET_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'PRESET':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Info className="w-3 h-3" />
            <span>PRESET</span>
          </span>
        );
      case 'USER_ENTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>USER ENTERED</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      
      {/* 1. SOLAR PANEL CARD */}
      <div 
        onClick={() => onSelectCategory && onSelectCategory('solar')}
        className={`bg-[#111e38] light:bg-white border rounded-2xl p-4 shadow-xl transition-all cursor-pointer ${
          isPanelActive 
            ? 'border-amber-400/80 ring-2 ring-amber-400/20 shadow-amber-500/10' 
            : 'border-[#1e3a5f] light:border-slate-200 hover:border-slate-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800/80 light:border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Sun className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-800">
                  Solar Panel
                </span>
                <span className="text-[10px] text-amber-400 font-mono block">
                  {results.panelCount} × {panel.ratedPowerW}W ({(results.actualArrayWatts / 1000).toFixed(1)} kW)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusBadge(panel.sourceStatus)}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Selected Model:</span>
              <select
                value={panel.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSelectPanelId(e.target.value)}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white light:text-slate-900 font-mono focus:outline-none focus:border-amber-400"
              >
                {panelsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.manufacturer} {p.model} ({p.ratedPowerW}W)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Specs Pill */}
            <div className="p-2 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">STC Voc / Vmp:</span>
                <span className="text-slate-200 light:text-slate-800">{panel.voc}V / {panel.vmp}V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Isc / Imp:</span>
                <span className="text-slate-200 light:text-slate-800">{panel.isc}A / {panel.imp}A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Temp Coeff Voc:</span>
                <span className="text-emerald-400">{panel.tempCoeffVoc}%/°C</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 light:border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenCustomModal('panel')}
            className="text-amber-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Panel</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('solar')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
          >
            <span>Inspect Specs →</span>
          </button>
        </div>
      </div>

      {/* 2. BATTERY CARD */}
      <div 
        onClick={() => onSelectCategory && onSelectCategory('battery')}
        className={`bg-[#111e38] light:bg-white border rounded-2xl p-4 shadow-xl transition-all cursor-pointer ${
          isBatteryActive 
            ? 'border-teal-400/80 ring-2 ring-teal-400/20 shadow-teal-500/10' 
            : 'border-[#1e3a5f] light:border-slate-200 hover:border-slate-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800/80 light:border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <BatteryCharging className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-800">
                  Battery Bank
                </span>
                <span className="text-[10px] text-teal-400 font-mono block">
                  {results.batteryCount} × {battery.nominalKwh} kWh ({(results.batteryCount * battery.nominalKwh).toFixed(1)} kWh)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusBadge(battery.sourceStatus)}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Selected Model:</span>
              <select
                value={battery.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSelectBatteryId(e.target.value)}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white light:text-slate-900 font-mono focus:outline-none focus:border-teal-400"
              >
                {batteriesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.manufacturer} {b.model} ({b.nominalKwh}kWh)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Specs Pill */}
            <div className="p-2 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal Voltage & Ah:</span>
                <span className="text-teal-400 font-bold">{battery.nominalVoltageV}V · {battery.nominalAh}Ah</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Cont. Discharge:</span>
                <span className="text-slate-200 light:text-slate-800">{battery.maxContinuousDischargeCurrentA} A/unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Parallel Stacking:</span>
                <span className={results.batteryCount <= battery.maxParallelUnits ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {results.batteryCount} / {battery.maxParallelUnits} units
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 light:border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenCustomModal('battery')}
            className="text-teal-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Battery</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('battery')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
          >
            <span>Inspect Specs →</span>
          </button>
        </div>
      </div>

      {/* 3. INVERTER CARD */}
      <div 
        onClick={() => onSelectCategory && onSelectCategory('inverter')}
        className={`bg-[#111e38] light:bg-white border rounded-2xl p-4 shadow-xl transition-all cursor-pointer ${
          isInverterActive 
            ? 'border-blue-400/80 ring-2 ring-blue-400/20 shadow-blue-500/10' 
            : 'border-[#1e3a5f] light:border-slate-200 hover:border-slate-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800/80 light:border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-800">
                  Inverter / Hybrid
                </span>
                <span className="text-[10px] text-blue-400 font-mono block">
                  1 × {inverter.continuousOutputPowerKw} kW (Surge {inverter.surgePowerKw} kW)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusBadge(inverter.sourceStatus)}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Selected Model:</span>
              <select
                value={inverter.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSelectInverterId(e.target.value)}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white light:text-slate-900 font-mono focus:outline-none focus:border-blue-400"
              >
                {invertersList.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.manufacturer} {inv.model} ({inv.continuousOutputPowerKw}kW)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Specs Pill */}
            <div className="p-2 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Continuous / Surge:</span>
                <span className="text-blue-400 font-bold">{inverter.continuousOutputPowerKw}kW / {inverter.surgePowerKw}kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DC Bus Voltage:</span>
                <span className="text-slate-200 light:text-slate-800">{inverter.batteryVoltageV}V (Max {inverter.maxDcInputCurrentA}A)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-cyan-400">{inverter.isHybrid ? `Hybrid (${inverter.numberOfMppts || 2} MPPTs)` : 'Pure Off-Grid'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 light:border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenCustomModal('inverter')}
            className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Inverter</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('inverter')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
          >
            <span>Inspect Specs →</span>
          </button>
        </div>
      </div>

      {/* 4. MPPT CONTROLLER CARD */}
      <div 
        onClick={() => onSelectCategory && onSelectCategory('mppt')}
        className={`bg-[#111e38] light:bg-white border rounded-2xl p-4 shadow-xl transition-all cursor-pointer ${
          isMpptActive 
            ? 'border-cyan-400/80 ring-2 ring-cyan-400/20 shadow-cyan-500/10' 
            : 'border-[#1e3a5f] light:border-slate-200 hover:border-slate-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800/80 light:border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sliders className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-800">
                  MPPT Controller
                </span>
                <span className="text-[10px] text-cyan-400 font-mono block">
                  {results.mpptUnitsCount} × {mppt.maxChargingCurrentA}A ({results.installedMpptCurrentA}A installed)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusBadge(mppt.sourceStatus)}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Selected Model:</span>
              <select
                value={mppt.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSelectMpptId(e.target.value)}
                disabled={inverter.isHybrid}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white light:text-slate-900 font-mono focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                {mpptsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.manufacturer} {m.model} ({m.maxChargingCurrentA}A)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Specs Pill */}
            <div className="p-2 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Charge Ampacity:</span>
                <span className="text-cyan-400 font-bold">{mppt.maxChargingCurrentA} A/unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max PV Voc:</span>
                <span className="text-slate-200 light:text-slate-800">{inverter.isHybrid ? inverter.maxPvVoc : mppt.maxPvVoc} V cold</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking Range:</span>
                <span className="text-slate-200 light:text-slate-800">
                  {inverter.isHybrid ? `${inverter.mpptVoltageRangeMinV}–${inverter.mpptVoltageRangeMaxV}` : `${mppt.mpptVoltageMinV}–${mppt.mpptVoltageMaxV}`} V
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 light:border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenCustomModal('mppt')}
            disabled={inverter.isHybrid}
            className="text-cyan-400 hover:underline flex items-center gap-1 font-mono disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            <span>Custom MPPT</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('mppt')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
          >
            <span>Inspect Specs →</span>
          </button>
        </div>
      </div>

      {/* Datasheet Specifications Modal */}
      {activeSpecModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111e38] text-white border border-[#1e3a5f] rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 uppercase font-mono">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Datasheet Record: {activeSpecModal}</span>
              </h4>
              <button type="button" onClick={() => setActiveSpecModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2 font-mono">
              {activeSpecModal === 'panel' && (
                <>
                  <div className="text-sm font-bold text-amber-400">{panel.manufacturer} {panel.model}</div>
                  <div>Status: {panel.sourceStatus}</div>
                  <div>Datasheet Document: {panel.datasheetName || 'Embedded manufacturer cut sheet'}</div>
                  <div>Verified Date: {panel.verificationDate || 'N/A'}</div>
                  <div className="p-2.5 rounded bg-[#0b1329] border border-slate-800 text-[11px] text-slate-300">
                    {panel.sourceNotes}
                  </div>
                </>
              )}

              {activeSpecModal === 'battery' && (
                <>
                  <div className="text-sm font-bold text-teal-400">{battery.manufacturer} {battery.model}</div>
                  <div>Status: {battery.sourceStatus}</div>
                  <div>Datasheet Document: {battery.datasheetName || 'Embedded manufacturer cut sheet'}</div>
                  <div>Verified Date: {battery.verificationDate || 'N/A'}</div>
                  <div className="p-2.5 rounded bg-[#0b1329] border border-slate-800 text-[11px] text-slate-300">
                    {battery.sourceNotes}
                  </div>
                </>
              )}

              {activeSpecModal === 'inverter' && (
                <>
                  <div className="text-sm font-bold text-blue-400">{inverter.manufacturer} {inverter.model}</div>
                  <div>Status: {inverter.sourceStatus}</div>
                  <div>Datasheet Document: {inverter.datasheetName || 'Embedded manufacturer cut sheet'}</div>
                  <div>Verified Date: {inverter.verificationDate || 'N/A'}</div>
                  <div className="p-2.5 rounded bg-[#0b1329] border border-slate-800 text-[11px] text-slate-300">
                    {inverter.sourceNotes}
                  </div>
                </>
              )}

              {activeSpecModal === 'mppt' && (
                <>
                  <div className="text-sm font-bold text-cyan-400">{mppt.manufacturer} {mppt.model}</div>
                  <div>Status: {mppt.sourceStatus}</div>
                  <div>Datasheet Document: {mppt.datasheetName || 'Embedded manufacturer cut sheet'}</div>
                  <div>Verified Date: {mppt.verificationDate || 'N/A'}</div>
                  <div className="p-2.5 rounded bg-[#0b1329] border border-slate-800 text-[11px] text-slate-300">
                    {mppt.sourceNotes}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSpecModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
