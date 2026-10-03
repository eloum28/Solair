import React from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';
import { AdvancedSettings } from '../types/solar';
import { Translations } from '../lib/translations';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvancedSettings;
  onUpdateSettings: (settings: AdvancedSettings) => void;
  t: Translations;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  t,
}) => {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    onUpdateSettings({
      systemLosses: 0.15,
      inverterEfficiency: 0.92,
      batteryRoundtripEfficiency: 0.92,
      pvDerating: 0.05,
      cableLoss: 0.02,
      tempDerating: 0.05,
      panelDegradationAnnual: 0.005,
      safeSocThreshold: 0.20,
      dangerSocThreshold: 0.10,
    });
  };

  const handleField = (field: keyof AdvancedSettings, val: number) => {
    onUpdateSettings({
      ...settings,
      [field]: val,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
              {t.advancedSettings}
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

        <p className="text-xs text-slate-400 mb-4">
          Fine-tune precision thermodynamic, resistive, and chemical engineering derating parameters.
        </p>

        <div className="space-y-3.5 text-xs">
          
          {/* System Losses */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">{t.systemLosses} (Dust, mismatch)</span>
              <span className="font-mono text-emerald-400 font-semibold">{Math.round(settings.systemLosses * 100)}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={Math.round(settings.systemLosses * 100)}
              onChange={(e) => handleField('systemLosses', parseInt(e.target.value) / 100)}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Inverter Efficiency */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">Inverter DC to AC Efficiency</span>
              <span className="font-mono text-blue-400 font-semibold">{Math.round(settings.inverterEfficiency * 100)}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="98"
              value={Math.round(settings.inverterEfficiency * 100)}
              onChange={(e) => handleField('inverterEfficiency', parseInt(e.target.value) / 100)}
              className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Battery Roundtrip Efficiency */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">{t.batteryRoundtrip}</span>
              <span className="font-mono text-teal-400 font-semibold">{Math.round(settings.batteryRoundtripEfficiency * 100)}%</span>
            </div>
            <input
              type="range"
              min="75"
              max="98"
              value={Math.round(settings.batteryRoundtripEfficiency * 100)}
              onChange={(e) => handleField('batteryRoundtripEfficiency', parseInt(e.target.value) / 100)}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Cable Loss */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">{t.cableLoss} (DC & AC voltage drop)</span>
              <span className="font-mono text-amber-400 font-semibold">{Math.round(settings.cableLoss * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={Math.round(settings.cableLoss * 100)}
              onChange={(e) => handleField('cableLoss', parseInt(e.target.value) / 100)}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Temperature Derating */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">{t.tempDerating} (Tropical heat coefficient)</span>
              <span className="font-mono text-rose-400 font-semibold">{Math.round(settings.tempDerating * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={Math.round(settings.tempDerating * 100)}
              onChange={(e) => handleField('tempDerating', parseInt(e.target.value) / 100)}
              className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Annual Degradation */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 light:text-slate-700">{t.annualDegradation}</span>
              <span className="font-mono text-slate-400 font-semibold">{(settings.panelDegradationAnnual * 100).toFixed(1)}% / yr</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={settings.panelDegradationAnnual * 100}
              onChange={(e) => handleField('panelDegradationAnnual', parseFloat(e.target.value) / 100)}
              className="w-full accent-slate-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 light:border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Engineering Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
