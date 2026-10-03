import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Cpu, Sun, BatteryCharging, Sliders, Shield } from 'lucide-react';
import { SolarPanel, Battery, Inverter, MPPTController, EquipmentCategory } from '../types/equipment';

interface CustomEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: EquipmentCategory;
  onSavePanel: (panel: SolarPanel) => void;
  onSaveBattery: (battery: Battery) => void;
  onSaveInverter: (inverter: Inverter) => void;
  onSaveMppt: (mppt: MPPTController) => void;
}

export const CustomEquipmentModal: React.FC<CustomEquipmentModalProps> = ({
  isOpen,
  onClose,
  category,
  onSavePanel,
  onSaveBattery,
  onSaveInverter,
  onSaveMppt,
}) => {
  if (!isOpen) return null;

  // Base state
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [isDatasheetVerified, setIsDatasheetVerified] = useState(false);
  const [datasheetName, setDatasheetName] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');

  // Panel fields
  const [ratedPowerW, setRatedPowerW] = useState(400);
  const [voc, setVoc] = useState(37.2);
  const [vmp, setVmp] = useState(31.2);
  const [isc, setIsc] = useState(13.68);
  const [imp, setImp] = useState(12.82);
  const [tempCoeffVoc, setTempCoeffVoc] = useState(-0.28);
  const [maxSystemVoltageV, setMaxSystemVoltageV] = useState(1500);

  // Battery fields
  const [chemistry, setChemistry] = useState<'LiFePO4' | 'AGM' | 'Gel' | 'Flooded'>('LiFePO4');
  const [nominalVoltageV, setNominalVoltageV] = useState(51.2);
  const [nominalAh, setNominalAh] = useState(100);
  const [recommendedDodPercent, setRecommendedDodPercent] = useState(80);
  const [maxContinuousDischargeCurrentA, setMaxContinuousDischargeCurrentA] = useState(100);
  const [maxContinuousChargeCurrentA, setMaxContinuousChargeCurrentA] = useState(80);
  const [maxParallelUnits, setMaxParallelUnits] = useState(16);
  const [commsCan, setCommsCan] = useState(true);
  const [commsRs485, setCommsRs485] = useState(true);

  // Inverter fields
  const [continuousOutputPowerKw, setContinuousOutputPowerKw] = useState(6.0);
  const [surgePowerKw, setSurgePowerKw] = useState(12.0);
  const [surgeDurationSec, setSurgeDurationSec] = useState(10);
  const [invBatteryVoltageV, setInvBatteryVoltageV] = useState(48);
  const [invEfficiencyPercent, setInvEfficiencyPercent] = useState(95);
  const [isHybrid, setIsHybrid] = useState(true);
  const [maxPvVoc, setMaxPvVoc] = useState(500);
  const [mpptMinV, setMpptMinV] = useState(125);
  const [mpptMaxV, setMpptMaxV] = useState(425);
  const [maxPvCurrentPerMpptA, setMaxPvCurrentPerMpptA] = useState(18);

  // MPPT fields
  const [mpptVocLimit, setMpptVocLimit] = useState(250);
  const [mpptChargeCurrentA, setMpptChargeCurrentA] = useState(100);
  const [mpptOperatingMinV, setMpptOperatingMinV] = useState(60);
  const [mpptOperatingMaxV, setMpptOperatingMaxV] = useState(245);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturer.trim() || !model.trim()) return;

    const sourceStatus = isDatasheetVerified ? 'DATASHEET_VERIFIED' : 'USER_ENTERED';
    const id = `custom-${category}-${Date.now()}`;

    if (category === 'panel') {
      const p: SolarPanel = {
        id,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        sourceStatus,
        datasheetName: datasheetName.trim() || undefined,
        datasheetVerified: isDatasheetVerified,
        verificationDate: isDatasheetVerified ? new Date().toISOString().split('T')[0] : undefined,
        sourceNotes: sourceNotes.trim() || 'User custom solar panel specification.',
        ratedPowerW,
        voc,
        vmp,
        isc,
        imp,
        tempCoeffVoc,
        tempCoeffIsc: 0.05,
        tempCoeffPmax: -0.35,
        maxSystemVoltageV,
        moduleEfficiencyPercent: 20.5,
      };
      onSavePanel(p);
    } else if (category === 'battery') {
      const comms: string[] = [];
      if (commsCan) comms.push('CAN');
      if (commsRs485) comms.push('RS485');
      const b: Battery = {
        id,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        sourceStatus,
        datasheetName: datasheetName.trim() || undefined,
        datasheetVerified: isDatasheetVerified,
        verificationDate: isDatasheetVerified ? new Date().toISOString().split('T')[0] : undefined,
        sourceNotes: sourceNotes.trim() || 'User custom battery bank specification.',
        chemistry,
        nominalVoltageV,
        nominalAh,
        nominalKwh: Number(((nominalVoltageV * nominalAh) / 1000).toFixed(2)),
        recommendedDodPercent,
        maxContinuousChargeCurrentA,
        maxContinuousDischargeCurrentA,
        peakDischargeCurrentA: maxContinuousDischargeCurrentA * 1.5,
        maxParallelUnits,
        maxSeriesUnits: 1,
        communicationProtocols: comms,
        cycleLife: 6000,
      };
      onSaveBattery(b);
    } else if (category === 'inverter') {
      const inv: Inverter = {
        id,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        sourceStatus,
        datasheetName: datasheetName.trim() || undefined,
        datasheetVerified: isDatasheetVerified,
        verificationDate: isDatasheetVerified ? new Date().toISOString().split('T')[0] : undefined,
        sourceNotes: sourceNotes.trim() || 'User custom inverter specification.',
        continuousOutputPowerKw,
        surgePowerKw,
        surgeDurationSec,
        batteryVoltageV: invBatteryVoltageV,
        maxDcInputCurrentA: Number(((continuousOutputPowerKw * 1000) / (invBatteryVoltageV * (invEfficiencyPercent / 100))).toFixed(0)),
        acOutputVoltageV: 230,
        acFrequencyHz: 50,
        efficiencyPercent: invEfficiencyPercent,
        lowVoltageCutoffV: 40.0,
        isHybrid,
        maxPvVoc: isHybrid ? maxPvVoc : undefined,
        mpptVoltageRangeMinV: isHybrid ? mpptMinV : undefined,
        mpptVoltageRangeMaxV: isHybrid ? mpptMaxV : undefined,
        maxPvCurrentPerMpptA: isHybrid ? maxPvCurrentPerMpptA : undefined,
        parallelCapability: true,
      };
      onSaveInverter(inv);
    } else if (category === 'mppt') {
      const m: MPPTController = {
        id,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        sourceStatus,
        datasheetName: datasheetName.trim() || undefined,
        datasheetVerified: isDatasheetVerified,
        verificationDate: isDatasheetVerified ? new Date().toISOString().split('T')[0] : undefined,
        sourceNotes: sourceNotes.trim() || 'User custom MPPT charge controller specification.',
        batteryVoltageSupport: [12, 24, 48],
        maxPvVoc: mpptVocLimit,
        mpptVoltageMinV: mpptOperatingMinV,
        mpptVoltageMaxV: mpptOperatingMaxV,
        maxPvInputCurrentA: mpptChargeCurrentA * 0.7,
        maxPvShortCircuitCurrentA: mpptChargeCurrentA * 0.8,
        maxChargingCurrentA: mpptChargeCurrentA,
        maxPvPowerW_48V: mpptChargeCurrentA * 58,
        efficiencyPercent: 98,
        numberOfTrackers: 1,
      };
      onSaveMppt(m);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#111e38] text-white border border-[#1e3a5f] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              {category === 'panel' && <Sun className="w-5 h-5" />}
              {category === 'battery' && <BatteryCharging className="w-5 h-5" />}
              {category === 'inverter' && <Cpu className="w-5 h-5" />}
              {category === 'mppt' && <Sliders className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="text-sm font-bold capitalize">Define Custom {category}</h3>
              <p className="text-xs text-slate-400">Enter authentic datasheet values for your specific hardware.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* General Identification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Manufacturer</label>
              <input
                type="text"
                required
                placeholder="e.g. Canadian Solar, Victron, Deye"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Model / Part Number</label>
              <input
                type="text"
                required
                placeholder="e.g. CS6R-400MS or SUN-6K"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Category Specific Technical Fields */}
          {category === 'panel' && (
            <div className="p-3 rounded-xl bg-[#0b1329]/70 border border-slate-800 space-y-3">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold block">Photovoltaic STC Parameters</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px]">Rated Power (W)</label>
                  <input
                    type="number"
                    value={ratedPowerW}
                    onChange={(e) => setRatedPowerW(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Voc (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={voc}
                    onChange={(e) => setVoc(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Vmp (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vmp}
                    onChange={(e) => setVmp(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Isc (A)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={isc}
                    onChange={(e) => setIsc(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Imp (A)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={imp}
                    onChange={(e) => setImp(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Voc Coeff (%/°C)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempCoeffVoc}
                    onChange={(e) => setTempCoeffVoc(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'battery' && (
            <div className="p-3 rounded-xl bg-[#0b1329]/70 border border-slate-800 space-y-3">
              <span className="text-[11px] font-mono text-teal-400 font-semibold block">Energy Storage & Current Specs</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px]">Nominal Voltage (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nominalVoltageV}
                    onChange={(e) => setNominalVoltageV(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Capacity (Ah)</label>
                  <input
                    type="number"
                    value={nominalAh}
                    onChange={(e) => setNominalAh(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Max DoD (%)</label>
                  <input
                    type="number"
                    value={recommendedDodPercent}
                    onChange={(e) => setRecommendedDodPercent(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Continuous Discharge (A)</label>
                  <input
                    type="number"
                    value={maxContinuousDischargeCurrentA}
                    onChange={(e) => setMaxContinuousDischargeCurrentA(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Continuous Charge (A)</label>
                  <input
                    type="number"
                    value={maxContinuousChargeCurrentA}
                    onChange={(e) => setMaxContinuousChargeCurrentA(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Max Parallel Units</label>
                  <input
                    type="number"
                    value={maxParallelUnits}
                    onChange={(e) => setMaxParallelUnits(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'inverter' && (
            <div className="p-3 rounded-xl bg-[#0b1329]/70 border border-slate-800 space-y-3">
              <span className="text-[11px] font-mono text-blue-400 font-semibold block">Continuous & Surge Ratings</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px]">Continuous Power (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={continuousOutputPowerKw}
                    onChange={(e) => setContinuousOutputPowerKw(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Surge Power (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={surgePowerKw}
                    onChange={(e) => setSurgePowerKw(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Surge Duration (s)</label>
                  <input
                    type="number"
                    value={surgeDurationSec}
                    onChange={(e) => setSurgeDurationSec(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Battery Voltage (V)</label>
                  <input
                    type="number"
                    value={invBatteryVoltageV}
                    onChange={(e) => setInvBatteryVoltageV(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Efficiency (%)</label>
                  <input
                    type="number"
                    value={invEfficiencyPercent}
                    onChange={(e) => setInvEfficiencyPercent(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <input
                    type="checkbox"
                    checked={isHybrid}
                    onChange={(e) => setIsHybrid(e.target.checked)}
                    id="isHybridCheck"
                    className="accent-blue-500 rounded"
                  />
                  <label htmlFor="isHybridCheck" className="text-slate-300 cursor-pointer">Hybrid (PV inputs built-in)</label>
                </div>
              </div>
            </div>
          )}

          {category === 'mppt' && (
            <div className="p-3 rounded-xl bg-[#0b1329]/70 border border-slate-800 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold block">MPPT Electrical Ratings</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px]">Max PV Voc Cold (V)</label>
                  <input
                    type="number"
                    value={mpptVocLimit}
                    onChange={(e) => setMpptVocLimit(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">Max Charge Current (A)</label>
                  <input
                    type="number"
                    value={mpptChargeCurrentA}
                    onChange={(e) => setMpptChargeCurrentA(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">MPPT Voltage Min (V)</label>
                  <input
                    type="number"
                    value={mpptOperatingMinV}
                    onChange={(e) => setMpptOperatingMinV(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px]">MPPT Voltage Max (V)</label>
                  <input
                    type="number"
                    value={mpptOperatingMaxV}
                    onChange={(e) => setMpptOperatingMaxV(Number(e.target.value))}
                    className="w-full bg-[#111e38] border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Verification Status & Datasheet Preparation (Section 15, 16) */}
          <div className="p-3 rounded-xl bg-[#0b1329] border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Datasheet Verification Status</span>
            </span>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isDatasheetVerified}
                onChange={(e) => setIsDatasheetVerified(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>
                I have verified these specifications against an official manufacturer cut sheet. (Marks as <strong className="text-emerald-400">DATASHEET VERIFIED</strong>)
              </span>
            </label>

            <div>
              <label className="block text-slate-400 text-[11px] mb-0.5">Datasheet Document Name / URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Deye_SUN-6K-SG01LP1_Specs.pdf"
                value={datasheetName}
                onChange={(e) => setDatasheetName(e.target.value)}
                className="w-full bg-[#111e38] border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Save Custom {category}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
