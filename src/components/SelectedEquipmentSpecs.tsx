import React, { useState } from 'react';
import { 
  Sun, 
  BatteryCharging, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Link, 
  Calendar, 
  Check, 
  X, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  SolarPanel, 
  Battery, 
  Inverter, 
  MPPTController, 
  EquipmentCategory, 
  EquipmentSourceStatus 
} from '../types/equipment';
import { Project, CalculationResults } from '../types/solar';

interface SelectedEquipmentSpecsProps {
  category: EquipmentCategory;
  panel: SolarPanel;
  battery: Battery;
  inverter: Inverter;
  mppt: MPPTController;
  results: CalculationResults;
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
}

export const SelectedEquipmentSpecs: React.FC<SelectedEquipmentSpecsProps> = ({
  category,
  panel,
  battery,
  inverter,
  mppt,
  results,
  project,
  onUpdateProject,
}) => {
  // Normalize category: handle 'solar' vs 'panel'
  const activeCat = category === 'panel' ? 'solar' : category;

  // Local state for datasheet controls
  const currentItem = activeCat === 'solar' ? panel : activeCat === 'battery' ? battery : activeCat === 'inverter' ? inverter : mppt;
  
  const [datasheetAttached, setDatasheetAttached] = useState<boolean>(Boolean(currentItem.datasheetAttached || currentItem.datasheetName));
  const [datasheetVerified, setDatasheetVerified] = useState<boolean>(Boolean(currentItem.datasheetVerified));
  const [verificationNotes, setVerificationNotes] = useState<string>(currentItem.verificationNotes || currentItem.sourceNotes || '');
  const [datasheetDocName, setDatasheetDocName] = useState<string>(currentItem.datasheetName || '');
  const [datasheetUrl, setDatasheetUrl] = useState<string>(currentItem.datasheetURL || '');
  const [dismissedImpact, setDismissedImpact] = useState<Record<string, boolean>>({});

  // Source Status Badge Helper
  const getStatusBadge = (status: EquipmentSourceStatus) => {
    switch (status) {
      case 'DATASHEET_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DATASHEET VERIFIED</span>
          </span>
        );
      case 'PRESET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Info className="w-3.5 h-3.5" />
            <span>PRESET SPEC</span>
          </span>
        );
      case 'USER_ENTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>USER ENTERED</span>
          </span>
        );
    }
  };

  // Handle saving datasheet verification state
  const handleSaveDatasheetVerification = (isAttached: boolean, isVerified: boolean) => {
    setDatasheetAttached(isAttached);
    setDatasheetVerified(isVerified);

    const newSourceStatus: EquipmentSourceStatus = isVerified ? 'DATASHEET_VERIFIED' : currentItem.sourceStatus === 'PRESET' ? 'PRESET' : 'USER_ENTERED';
    const dateStr = isVerified ? new Date().toISOString().split('T')[0] : undefined;

    const updatedItem = {
      ...currentItem,
      datasheetAttached: isAttached,
      datasheetVerified: isVerified,
      sourceStatus: newSourceStatus,
      verificationDate: dateStr,
      verificationNotes,
      datasheetName: datasheetDocName,
      datasheetURL: datasheetUrl,
    };

    if (activeCat === 'solar') {
      const customPanels = (project.customPanels || []).map((p) => p.id === panel.id ? (updatedItem as SolarPanel) : p);
      onUpdateProject({
        selectedPanel: updatedItem as SolarPanel,
        customPanels,
      });
    } else if (activeCat === 'battery') {
      const customBatteries = (project.customBatteries || []).map((b) => b.id === battery.id ? (updatedItem as Battery) : b);
      onUpdateProject({
        selectedBattery: updatedItem as Battery,
        customBatteries,
      });
    } else if (activeCat === 'inverter') {
      const customInverters = (project.customInverters || []).map((inv) => inv.id === inverter.id ? (updatedItem as Inverter) : inv);
      onUpdateProject({
        selectedInverter: updatedItem as Inverter,
        customInverters,
        inverter: {
          ...project.inverter,
          isManufacturerVerified: isVerified,
        }
      });
    } else if (activeCat === 'mppt') {
      const customMppts = (project.customMppts || []).map((m) => m.id === mppt.id ? (updatedItem as MPPTController) : m);
      onUpdateProject({
        selectedMppt: updatedItem as MPPTController,
        customMppts,
        mppt: {
          ...project.mppt,
          isManufacturerVerified: isVerified,
        }
      });
    }
  };

  // -------------------------------------------------------------
  // EQUIPMENT CHANGE IMPACT CALCULATIONS (Sections 4 & 15)
  // -------------------------------------------------------------

  // 1. Solar Panel Impact
  const isPanelWattageDiff = panel.ratedPowerW !== project.solar.panelWattage;
  const newPanelCount = Math.ceil(results.requiredArrayW / panel.ratedPowerW);
  const currentArrayKw = (results.panelCount * project.solar.panelWattage) / 1000;
  const newArrayKw = (newPanelCount * panel.ratedPowerW) / 1000;
  const newSolarGenKwh = Number((results.dailySolarGenerationKwh * (newArrayKw / (currentArrayKw || 1))).toFixed(2));
  const costPerWatt = project.costs.panelUnitPrice ? project.costs.panelUnitPrice / (project.solar.panelWattage || 400) : 0.35;
  const currentPanelCost = Math.round(currentArrayKw * 1000 * costPerWatt);
  const newPanelCost = Math.round(newArrayKw * 1000 * costPerWatt);

  // Suggested strings with new panel
  const maxMpptVoc = inverter.isHybrid && inverter.maxPvVoc ? inverter.maxPvVoc : mppt.maxPvVoc || 250;
  const coldVocPerPanel = panel.voc * (1 + Math.abs(panel.tempCoeffVoc / 100) * (25 - 15));
  const suggestedPanelsPerString = Math.max(1, Math.min(12, Math.floor((maxMpptVoc * 0.88) / (coldVocPerPanel || 40))));
  const suggestedParallelStrings = Math.ceil(newPanelCount / suggestedPanelsPerString);

  const handleApplyPanelConfiguration = () => {
    onUpdateProject({
      selectedPanelId: panel.id,
      selectedPanel: panel,
      solar: {
        ...project.solar,
        panelWattage: panel.ratedPowerW,
      },
      stringDesign: {
        ...project.stringDesign,
        panelVoc: panel.voc,
        panelVmp: panel.vmp,
        panelIsc: panel.isc,
        panelImp: panel.imp,
        panelWatts: panel.ratedPowerW,
        tempCoeffVoc: panel.tempCoeffVoc,
        hasSpecs: true,
      },
    });
    setDismissedImpact({ ...dismissedImpact, solar: true });
  };

  // 2. Battery Impact
  const isBatteryKwhDiff = Math.abs(battery.nominalKwh - results.batteryUnitNominalKwh) > 0.05 || battery.nominalVoltageV !== project.battery.systemVoltage;
  const newBatteryUnitsCount = Math.ceil(results.requiredNominalBatteryKwh / (battery.nominalKwh || 5.12));
  const newInstalledBatteryKwh = Number((newBatteryUnitsCount * battery.nominalKwh).toFixed(1));

  const handleApplyBatteryConfiguration = () => {
    onUpdateProject({
      selectedBatteryId: battery.id,
      selectedBattery: battery,
      battery: {
        ...project.battery,
        modelName: `${battery.manufacturer} ${battery.model}`,
        chemistry: battery.chemistry,
        unitVoltage: battery.nominalVoltageV,
        unitAh: battery.nominalAh,
        unitNominalKwh: battery.nominalKwh,
        dodLimit: battery.recommendedDodPercent / 100,
      },
    });
    setDismissedImpact({ ...dismissedImpact, battery: true });
  };

  // 3. Inverter Impact
  const currentInverterKw = project.inverter.selectedSizeKw ?? results.recommendedInverterKw;
  const isInverterSizeDiff = Math.abs(inverter.continuousOutputPowerKw - currentInverterKw) > 0.1;
  const handleApplyInverterConfiguration = () => {
    onUpdateProject({
      selectedInverterId: inverter.id,
      selectedInverter: inverter,
      inverter: {
        ...project.inverter,
        selectedSizeKw: inverter.continuousOutputPowerKw,
        surgeRatingKw: inverter.surgePowerKw,
        surgeDurationSec: inverter.surgeDurationSec,
        efficiency: inverter.efficiencyPercent / 100,
        isManufacturerVerified: inverter.sourceStatus === 'DATASHEET_VERIFIED' || datasheetVerified,
      },
    });
    setDismissedImpact({ ...dismissedImpact, inverter: true });
  };

  // 4. MPPT Impact
  const isMpptRatingDiff = Math.abs(mppt.maxChargingCurrentA - project.mppt.ratedCurrentA) > 1;
  const newMpptUnitsCount = Math.max(1, Math.ceil(results.requiredMpptCurrentA / mppt.maxChargingCurrentA));
  const handleApplyMpptConfiguration = () => {
    onUpdateProject({
      selectedMpptId: mppt.id,
      selectedMppt: mppt,
      mppt: {
        ...project.mppt,
        ratedCurrentA: mppt.maxChargingCurrentA,
        maxPvVoc: mppt.maxPvVoc,
        mpptVmin: mppt.mpptVoltageMinV,
        mpptVmax: mppt.mpptVoltageMaxV,
        maxInputCurrentA: mppt.maxPvInputCurrentA,
        isManufacturerVerified: mppt.sourceStatus === 'DATASHEET_VERIFIED' || datasheetVerified,
      },
    });
    setDismissedImpact({ ...dismissedImpact, mppt: true });
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              {activeCat === 'solar' && <Sun className="w-5 h-5 text-amber-400" />}
              {activeCat === 'battery' && <BatteryCharging className="w-5 h-5 text-teal-400" />}
              {activeCat === 'inverter' && <Cpu className="w-5 h-5 text-blue-400" />}
              {activeCat === 'mppt' && <Sliders className="w-5 h-5 text-cyan-400" />}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight uppercase">
                {activeCat === 'solar' && 'Photovoltaic Module Specifications'}
                {activeCat === 'battery' && 'Battery Storage Bank Specifications'}
                {activeCat === 'inverter' && 'Power Inverter & Conversion Specifications'}
                {activeCat === 'mppt' && 'MPPT Charge Controller Specifications'}
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                {currentItem.manufacturer} {currentItem.model}
              </p>
            </div>
          </div>
          <div>
            {getStatusBadge(currentItem.sourceStatus)}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EQUIPMENT CHANGE IMPACT NOTIFICATION BANNERS (Section 4 & 15) */}
        {/* ------------------------------------------------------------- */}

        {/* Solar Panel Change Impact */}
        {activeCat === 'solar' && isPanelWattageDiff && !dismissedImpact.solar && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-xs shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Selected Panel Change Impact</span>
              </span>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, solar: true })}
                className="text-slate-400 hover:text-white"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 light:text-slate-700 text-[11px] mb-2.5 leading-relaxed">
              Engineering Design used <strong>{project.solar.panelWattage}W</strong> panels, but selected hardware is <strong>{panel.ratedPowerW}W</strong>. Physical module count is automatically recalculated:
            </p>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0b1329]/80 light:bg-white border border-slate-800 font-mono text-[11px] mb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Original Design</span>
                <span className="text-slate-200 font-semibold">{results.panelCount} × {project.solar.panelWattage}W = {currentArrayKw.toFixed(2)} kW</span>
                <span className="text-slate-400 block text-[10px] mt-0.5">{results.dailySolarGenerationKwh} kWh/day · ${currentPanelCost}</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-amber-400 block text-[10px] uppercase">Selected Equipment</span>
                <span className="text-emerald-400 font-bold">{newPanelCount} × {panel.ratedPowerW}W = {newArrayKw.toFixed(2)} kW</span>
                <span className="text-emerald-400/90 block text-[10px] mt-0.5">{newSolarGenKwh} kWh/day · ${newPanelCost}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyPanelConfiguration}
                className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPLY TO PROJECT ({newPanelCount} PANELS)</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, solar: true })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Keep Current Design
              </button>
            </div>
          </div>
        )}

        {/* Battery Capacity Change Impact */}
        {activeCat === 'battery' && isBatteryKwhDiff && !dismissedImpact.battery && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/40 text-xs shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-teal-400 flex items-center gap-1.5 uppercase font-mono">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Battery Unit Capacity Alignment</span>
              </span>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, battery: true })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0b1329]/80 light:bg-white border border-slate-800 font-mono text-[11px] mb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Design Baseline</span>
                <span className="text-slate-200 font-semibold">{results.batteryCount} × {results.batteryUnitNominalKwh} kWh = {results.installedNominalBatteryKwh} kWh</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-teal-400 block text-[10px] uppercase">Selected Bank</span>
                <span className="text-emerald-400 font-bold">{newBatteryUnitsCount} × {battery.nominalKwh} kWh = {newInstalledBatteryKwh} kWh</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyBatteryConfiguration}
                className="flex-1 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPLY BATTERY CONFIGURATION ({newBatteryUnitsCount} UNITS)</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, battery: true })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Keep Current
              </button>
            </div>
          </div>
        )}

        {/* Inverter Rating Change Impact */}
        {activeCat === 'inverter' && isInverterSizeDiff && !dismissedImpact.inverter && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-500/40 text-xs shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase font-mono">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Inverter Rating Alignment</span>
              </span>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, inverter: true })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0b1329]/80 light:bg-white border border-slate-800 font-mono text-[11px] mb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Design Rating</span>
                <span className="text-slate-200 font-semibold">{project.inverter.selectedSizeKw} kW continuous / {project.inverter.surgeRatingKw} kW surge</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-blue-400 block text-[10px] uppercase">Selected Hardware</span>
                <span className="text-emerald-400 font-bold">{inverter.continuousOutputPowerKw} kW continuous / {inverter.surgePowerKw} kW surge</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyInverterConfiguration}
                className="flex-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPLY INVERTER ({inverter.continuousOutputPowerKw} kW)</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissedImpact({ ...dismissedImpact, inverter: true })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Keep Current
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TECHNICAL SPECIFICATIONS GRID (Sections 4, 5, 6, 7) */}
        {/* ------------------------------------------------------------- */}

        {/* SOLAR PANEL SPECIFICATIONS */}
        {activeCat === 'solar' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Rated Power (Pmax)</span>
                <span className="text-base font-bold text-emerald-400">{panel.ratedPowerW} W</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Open-Circuit Voc</span>
                <span className="text-base font-bold text-white light:text-slate-900">{panel.voc} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max Power Vmp</span>
                <span className="text-base font-bold text-white light:text-slate-900">{panel.vmp} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Short-Circuit Isc</span>
                <span className="text-base font-bold text-amber-400">{panel.isc} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max Power Imp</span>
                <span className="text-base font-bold text-amber-400">{panel.imp} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Voc Temp Coeff</span>
                <span className="text-base font-bold text-cyan-400">{panel.tempCoeffVoc} %/°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Power Temp Coeff</span>
                <span className="text-base font-bold text-slate-300 light:text-slate-700">{panel.tempCoeffPmax} %/°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max System Voltage</span>
                <span className="text-base font-bold text-slate-300 light:text-slate-700">{panel.maxSystemVoltageV} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Module Efficiency</span>
                <span className="text-base font-bold text-emerald-400">{panel.moduleEfficiencyPercent}%</span>
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div className="p-2.5 rounded-xl bg-[#0b1329]/40 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span>Dimensions: <strong className="text-slate-200">{panel.lengthMm || 1722} × {panel.widthMm || 1134} mm</strong></span>
              <span>Weight: <strong className="text-slate-200">{panel.weightKg || 21.5} kg</strong></span>
              <span>Warranty: <strong className="text-slate-200">{panel.warrantyYears || 12} Years</strong></span>
            </div>
          </div>
        )}

        {/* BATTERY STORAGE SPECIFICATIONS */}
        {activeCat === 'battery' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Chemistry</span>
                <span className="text-base font-bold text-teal-400">{battery.chemistry}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Nominal Voltage</span>
                <span className="text-base font-bold text-white light:text-slate-900">{battery.nominalVoltageV} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Nominal Capacity</span>
                <span className="text-base font-bold text-white light:text-slate-900">{battery.nominalAh} Ah ({battery.nominalKwh} kWh)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Recommended DoD</span>
                <span className="text-base font-bold text-emerald-400">{battery.recommendedDodPercent}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Continuous Discharge</span>
                <span className="text-base font-bold text-teal-400">{battery.maxContinuousDischargeCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Continuous Charge</span>
                <span className="text-base font-bold text-teal-400">{battery.maxContinuousChargeCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Discharge</span>
                <span className="text-base font-bold text-amber-400">{battery.peakDischargeCurrentA} A ({battery.peakDurationSec || 15}s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max Parallel Stacking</span>
                <span className="text-base font-bold text-sky-400">{battery.maxParallelUnits} Units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">BMS Communications</span>
                <span className="text-xs font-bold text-slate-200">{battery.communicationProtocols?.join(', ') || 'CAN / RS485'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b1329]/40 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span>Operating Temp: <strong className="text-slate-200">{battery.operatingTempRange || `${battery.operatingTempMinC ?? 0}°C to ${battery.operatingTempMaxC ?? 50}°C`}</strong></span>
              <span>Cycle Life: <strong className="text-slate-200">{battery.cycleLife || 6000} Cycles</strong></span>
              <span>Warranty: <strong className="text-slate-200">{battery.warrantyYears || 10} Years</strong></span>
            </div>
          </div>
        )}

        {/* INVERTER SPECIFICATIONS */}
        {activeCat === 'inverter' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Continuous Output</span>
                <span className="text-base font-bold text-white light:text-slate-900">{inverter.continuousOutputPowerKw} kW</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Surge Capability</span>
                <span className="text-base font-bold text-amber-400">{inverter.surgePowerKw} kW ({inverter.surgeDurationSec}s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Battery Bus Voltage</span>
                <span className="text-base font-bold text-teal-400">{inverter.batteryVoltageV} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max DC Input Current</span>
                <span className="text-base font-bold text-slate-200">{inverter.maxDcInputCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">AC Voltage & Freq</span>
                <span className="text-base font-bold text-slate-200">{inverter.acOutputVoltageV}V / {inverter.acFrequencyHz}Hz</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Inverter Efficiency</span>
                <span className="text-base font-bold text-emerald-400">{inverter.efficiencyPercent}%</span>
              </div>
            </div>

            {/* Hybrid MPPT Specs if Hybrid */}
            {inverter.isHybrid && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] space-y-1">
                <span className="font-bold text-blue-400 block uppercase">Integrated Hybrid Solar Trackers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div>Trackers: <strong className="text-white">{inverter.numberOfMppts || 2} MPPT</strong></div>
                  <div>Max PV Voc: <strong className="text-white">{inverter.maxPvVoc || 500} V</strong></div>
                  <div>MPPT Range: <strong className="text-white">{inverter.mpptVoltageRangeMinV || 120}–{inverter.mpptVoltageRangeMaxV || 450} V</strong></div>
                  <div>Max PV Power: <strong className="text-white">{inverter.maxPvInputPowerKw || 8} kW</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MPPT CHARGE CONTROLLER SPECIFICATIONS */}
        {activeCat === 'mppt' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max Charging Current</span>
                <span className="text-base font-bold text-cyan-400">{mppt.maxChargingCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max PV Input Voc</span>
                <span className="text-base font-bold text-white light:text-slate-900">{mppt.maxPvVoc} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">MPPT Voltage Range</span>
                <span className="text-base font-bold text-white light:text-slate-900">{mppt.mpptVoltageMinV} – {mppt.mpptVoltageMaxV} V</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max PV Input Current</span>
                <span className="text-base font-bold text-slate-200">{mppt.maxPvInputCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max PV Short Circuit Isc</span>
                <span className="text-base font-bold text-amber-400">{mppt.maxPvShortCircuitCurrentA} A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Efficiency</span>
                <span className="text-base font-bold text-emerald-400">{mppt.efficiencyPercent}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b1329]/40 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span>Battery Support: <strong className="text-slate-200">{mppt.batteryVoltageSupport?.join(', ') || '12V, 24V, 48V'}</strong></span>
              <span>Max PV Power @ 48V: <strong className="text-emerald-400">{mppt.maxPvPowerW_48V || 5800} W</strong></span>
              <span>Trackers: <strong className="text-slate-200">{mppt.numberOfTrackers || 1} Independent</strong></span>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* DATASHEET VERIFICATION CONTROLS (Section 11) */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 light:border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300 light:text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Datasheet & Manufacturer Cut Sheet Audit</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {datasheetVerified ? 'Status: DATASHEET VERIFIED ✓' : 'Status: VERIFICATION PENDING ⏳'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          
          {/* Document name & Link inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Datasheet Document Name</label>
              <input
                type="text"
                placeholder="e.g. Canadian_Solar_CS6R_MS_Specs.pdf"
                value={datasheetDocName}
                onChange={(e) => setDatasheetDocName(e.target.value)}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded px-2.5 py-1.5 text-white light:text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Datasheet Document URL / Archive</label>
              <input
                type="url"
                placeholder="https://manufacturer.com/datasheets/..."
                value={datasheetUrl}
                onChange={(e) => setDatasheetUrl(e.target.value)}
                className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded px-2.5 py-1.5 text-white light:text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Verification Engineer Notes */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Engineering Verification Notes</label>
            <textarea
              rows={2}
              placeholder="Verified against manufacturer cut-sheet revision 3.1. All electrical ratings STC/NOCT confirmed."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded px-2.5 py-1.5 text-white light:text-slate-900 text-xs focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Verification Action Checkboxes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasheetAttached}
                  onChange={(e) => handleSaveDatasheetVerification(e.target.checked, datasheetVerified)}
                  className="rounded bg-[#0b1329] border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 light:text-slate-700 font-medium">
                  Datasheet Attached
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasheetVerified}
                  onChange={(e) => handleSaveDatasheetVerification(datasheetAttached, e.target.checked)}
                  className="rounded bg-[#0b1329] border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-emerald-400 font-bold">
                  Datasheet Verified
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => handleSaveDatasheetVerification(datasheetAttached, datasheetVerified)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all self-end sm:self-auto"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Verification Status</span>
            </button>

          </div>

        </div>
      </div>

    </div>
  );
};
