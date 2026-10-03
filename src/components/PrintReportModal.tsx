import React from 'react';
import { Printer, X, ShieldCheck, Sun, BatteryCharging, Cpu, CheckCircle } from 'lucide-react';
import { Project, CalculationResults } from '../types/solar';
import { Translations } from '../lib/translations';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  results: CalculationResults;
  t: Translations;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  project,
  results,
  t,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currencySymbol = project.costs.currency === 'EUR' ? '€' : project.costs.currency === 'XOF' ? 'FCFA ' : '$';
  const fmt = (v: number) => new Intl.NumberFormat().format(Math.round(v));
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[95vh] relative print:p-0 print:shadow-none print:max-h-none print:w-full print:border-none">
        
        {/* Floating Controls (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 no-print">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {t.engineeringReport}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReport}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black text-slate-900 tracking-tight">⚡ VoltPlan</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-semibold rounded">
                  STANDALONE PV DESIGN REPORT
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {project.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Site Location: <strong>{project.location.city}, {project.location.country}</strong> · Peak Sun: <strong>{project.location.peakSunHours} PSH</strong>
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-500">
              <div>Ref: VP-{project.id.slice(-6).toUpperCase()}</div>
              <div>Date: {today}</div>
              <div className="mt-1 font-semibold text-emerald-700">Status: {results.status.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Daily Demand</span>
            <span className="text-lg font-bold font-mono text-slate-900">{results.dailyKwh} kWh/day</span>
            <span className="text-[10px] text-slate-500 block">Day: {results.daytimeKwh}k · Night: {results.nighttimeKwh}k</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">PV Solar Array</span>
            <span className="text-lg font-bold font-mono text-emerald-700">{(results.actualArrayWatts / 1000).toFixed(1)} kW</span>
            <span className="text-[10px] text-slate-500 block">{results.panelCount} × {results.panelWattage}W Modules</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Battery Storage</span>
            <span className="text-lg font-bold font-mono text-teal-700">{results.installedNominalBatteryKwh} kWh</span>
            <span className="text-[10px] text-slate-500 block">{results.batteryCount} × {project.battery.modelName}</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Power Conversion</span>
            <span className="text-lg font-bold font-mono text-blue-700">{results.selectedInverterKw} kW</span>
            <span className="text-[10px] text-slate-500 block">{results.mpptUnitsCount} × {results.mpptUnitRatingA}A MPPT</span>
          </div>
        </div>

        {/* Section 1: Detailed System Calculations */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            1. Photovoltaic & Energy Storage Sizing Synthesis
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1.5 border-r border-slate-100 pr-2">
              <div className="text-slate-500 font-sans font-semibold">Solar Generation</div>
              <div>Peak Sun Hours: <strong>{project.location.peakSunHours} hrs/day</strong></div>
              <div>Orientation Eff: <strong>{Math.round(project.solar.orientationEfficiency * 100)}%</strong></div>
              <div>Daily Generation: <strong>{results.dailySolarGenerationKwh} kWh/day</strong></div>
              <div>Design Reserve (Req): <strong>+{results.designReserveMargin}%</strong></div>
              <div>Actual Installed Margin: <strong className="text-emerald-700">+{results.actualInstalledSolarMargin}%</strong></div>
            </div>

            <div className="space-y-1.5 border-r border-slate-100 pr-2">
              <div className="text-slate-500 font-sans font-semibold">Battery Storage</div>
              <div>Chemistry: <strong>{project.battery.chemistry}</strong></div>
              <div>Max DoD: <strong>{Math.round(results.batteryDoD * 100)}%</strong></div>
              <div>Design Floor SOC: <strong>{results.recommendedMinSocPercent}%</strong></div>
              <div>Target Autonomy: <strong>{results.effectiveTargetAutonomyDays} days</strong></div>
              <div>Actual Autonomy: <strong className={results.isAutonomySufficient ? 'text-emerald-700' : 'text-amber-600'}>{results.actualAutonomyDays} days</strong></div>
              <div>Min Simulated SOC: <strong className={results.isBatterySufficientForNight ? 'text-emerald-700' : 'text-rose-600'}>{results.minSocReached}%</strong></div>
            </div>

            <div className="space-y-1.5">
              <div className="text-slate-500 font-sans font-semibold">Inverter & Power Bus</div>
              <div>DC Bus Voltage: <strong>{project.battery.systemVoltage}V DC</strong></div>
              <div>Peak Continuous: <strong>{(results.peakSimultaneousW / 1000).toFixed(2)} kW</strong></div>
              <div>Motor Surge: <strong>{(results.peakSurgeW / 1000).toFixed(2)} kW</strong></div>
              <div>Design Headroom: <strong>+{Math.round(project.inverter.headroom * 100)}%</strong></div>
              <div>MPPT Capacity: <strong>{results.installedMpptCurrentA} A ({results.requiredMpptCurrentA} A req)</strong></div>
            </div>
          </div>
        </div>

        {/* Section 2: Appliance Schedule */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
            2. Connected Appliance Load Profile
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-mono text-slate-700">
                <tr>
                  <th className="p-1.5">Appliance</th>
                  <th className="p-1.5 text-right">Qty</th>
                  <th className="p-1.5 text-right">Watts</th>
                  <th className="p-1.5 text-right">Total H</th>
                  <th className="p-1.5 text-right">Day H</th>
                  <th className="p-1.5 text-right">Night H</th>
                  <th className="p-1.5 text-right">Simul %</th>
                  <th className="p-1.5 text-right">Surge ×</th>
                  <th className="p-1.5 text-right">Daily Wh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {project.appliances.filter((a) => a.enabled).map((item) => (
                  <tr key={item.id}>
                    <td className="p-1.5 font-sans font-medium">{item.name}</td>
                    <td className="p-1.5 text-right">{item.quantity}</td>
                    <td className="p-1.5 text-right">{item.watts}W</td>
                    <td className="p-1.5 text-right">{item.hoursPerDay}</td>
                    <td className="p-1.5 text-right">{item.dayHours}</td>
                    <td className="p-1.5 text-right">{item.nightHours}</td>
                    <td className="p-1.5 text-right">{Math.round(item.simultaneousFactor * 100)}%</td>
                    <td className="p-1.5 text-right">{item.surgeMultiplier}×</td>
                    <td className="p-1.5 text-right font-bold">{(item.quantity * item.watts * item.hoursPerDay).toLocaleString()} Wh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Bill of Materials & Cost Breakdown */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
            3. {t.billOfMaterials}
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 font-mono text-slate-700">
              <tr>
                <th className="p-1.5">Component / Description</th>
                <th className="p-1.5 text-right">Qty</th>
                <th className="p-1.5 text-right">Unit Price</th>
                <th className="p-1.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {results.costs.items.map((it) => (
                <tr key={it.itemKey}>
                  <td className="p-1.5 font-sans">{it.name}</td>
                  <td className="p-1.5 text-right">{it.quantity}</td>
                  <td className="p-1.5 text-right">{currencySymbol}{fmt(it.unitPrice)}</td>
                  <td className="p-1.5 text-right font-semibold">{currencySymbol}{fmt(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-900 font-mono font-bold bg-slate-50 text-xs">
              <tr>
                <td colSpan={3} className="p-2 font-sans">{t.grandTotal}</td>
                <td className="p-2 text-right text-emerald-800">{currencySymbol}{fmt(results.costs.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 4: Engineering Assumptions & Compliance */}
        <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 leading-relaxed">
          <div className="font-semibold text-slate-700 mb-1">{t.engineeringAssumptions}:</div>
          <p>
            Array sizing accounts for {Math.round(project.advanced.systemLosses * 100)}% system losses, {Math.round(project.advanced.pvDerating * 100)}% soiling derate, and {Math.round(project.advanced.tempDerating * 100)}% temperature coefficient derating. Battery capacity guarantees {results.effectiveTargetAutonomyDays} days autonomy (actual delivered: {results.actualAutonomyDays} days) at {Math.round(results.batteryDoD * 100)}% maximum depth of discharge with a minimum {results.recommendedMinSocPercent}% SOC design floor.
          </p>
          <div className="mt-2 text-emerald-800 font-medium">
            {t.certifiedNotice}
          </div>
        </div>

      </div>
    </div>
  );
};
