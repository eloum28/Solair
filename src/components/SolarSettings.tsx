import React from 'react';
import { Sun, Compass, CloudRain, MapPin, Sliders, CheckCircle2, TrendingUp } from 'lucide-react';
import { LocationConfig, SolarArrayConfig, CalculationResults } from '../types/solar';
import { PRESET_LOCATIONS } from '../lib/presets';
import { Translations } from '../lib/translations';
import { Tooltip } from './Tooltip';

interface SolarSettingsProps {
  location: LocationConfig;
  onUpdateLocation: (loc: LocationConfig) => void;
  solar: SolarArrayConfig;
  onUpdateSolar: (solar: SolarArrayConfig) => void;
  results: CalculationResults;
  t: Translations;
  onOpenAudit?: (auditKey: string) => void;
}

export const SolarSettings: React.FC<SolarSettingsProps> = ({
  location,
  onUpdateLocation,
  solar,
  onUpdateSolar,
  results,
  t,
  onOpenAudit,
}) => {
  const panelWattageOptions = [400, 450, 500, 550, 600];

  const handleSelectPresetLocation = (preset: LocationConfig) => {
    onUpdateLocation({
      ...location,
      country: preset.country,
      city: preset.city,
      peakSunHours: preset.peakSunHours,
      cloudyDaysBuffer: preset.cloudyDaysBuffer,
    });
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">
            {t.solarResource}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => onOpenAudit('solar')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Audit Solar</span>
            </button>
          )}
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {results.actualArrayWatts.toLocaleString()} W Array
          </span>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Solar Energy Balance Summary & Reserve vs Actual Margin (Requirement 2) */}
        <div className="p-3 rounded-xl bg-[#0b1329]/80 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-slate-300 light:text-slate-700 gap-1.5 mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Solar Energy Balance & Sizing Margins</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">
                Design Reserve: <strong className="text-slate-200 light:text-slate-700">+{results.designReserveMargin}%</strong>
              </span>
              <span className={`font-bold ${results.actualInstalledSolarMargin >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Actual Margin: {results.actualInstalledSolarMargin > 0 ? `+${results.actualInstalledSolarMargin}%` : `${results.actualInstalledSolarMargin}%`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] mb-2.5">
            <div className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-800 light:border-slate-200">
              <span className="text-slate-400 block text-[10px] font-sans">Daily Demand</span>
              <span className="font-bold text-white light:text-slate-900">{results.dailyKwh} kWh/d</span>
            </div>

            <div className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-800 light:border-slate-200">
              <span className="text-slate-400 block text-[10px] font-sans">Solar Generation</span>
              <span className="font-bold text-emerald-400">{results.dailySolarGenerationKwh} kWh/d</span>
            </div>

            <div className="p-2 rounded-lg bg-[#111e38] light:bg-white border border-slate-800 light:border-slate-200">
              <span className="text-slate-400 block text-[10px] font-sans">Net Balance</span>
              <span className={`font-bold ${results.dailySolarSurplusDeficitKwh >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {results.dailySolarSurplusDeficitKwh > 0 ? `+${results.dailySolarSurplusDeficitKwh}` : results.dailySolarSurplusDeficitKwh} kWh/d
              </span>
            </div>
          </div>

          {/* Engineering Margin Reconciliation Note (Section 2) */}
          <div className="text-[11px] text-slate-400 light:text-slate-600 bg-[#111e38]/70 light:bg-slate-100 p-2 rounded-lg border border-slate-800/80 light:border-slate-200">
            <span className="text-slate-300 light:text-slate-800 font-semibold">Engineering Note:</span> Actual installed solar margin ({results.actualInstalledSolarMargin > 0 ? `+${results.actualInstalledSolarMargin}%` : `${results.actualInstalledSolarMargin}%`}) may exceed requested design reserve (+{results.designReserveMargin}%) because panel count is rounded upward to whole modules ({results.panelCount} panels) and balanced across electrical string configurations ({results.stringDesign ? `${results.stringDesign.parallelStrings} strings × ${results.stringDesign.panelsPerString} modules in series` : `${results.panelCount} panels`}).
          </div>
        </div>

        {/* Location Presets & Inputs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 light:text-slate-700 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Location Presets</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {location.city}, {location.country}
            </span>
          </div>

          {/* Horizontal Scrolling Chips (Requirement 7) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={`${loc.country}-${loc.city}`}
                type="button"
                onClick={() => handleSelectPresetLocation(loc)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-mono whitespace-nowrap transition-colors border shrink-0 ${
                  location.city === loc.city && location.country === loc.country
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold shadow-sm'
                    : 'bg-[#0b1329] light:bg-slate-50 hover:bg-[#172646] light:hover:bg-slate-200 border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700'
                }`}
              >
                {loc.city} ({loc.peakSunHours}h)
              </button>
            ))}
          </div>

          {/* Manual Country / City inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t.country}</span>
              <input
                type="text"
                value={location.country}
                onChange={(e) => onUpdateLocation({ ...location, country: e.target.value })}
                className="w-full min-h-[42px] bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-white light:text-slate-900 focus:outline-none focus:border-amber-400 text-sm font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t.city}</span>
              <input
                type="text"
                value={location.city}
                onChange={(e) => onUpdateLocation({ ...location, city: e.target.value })}
                className="w-full min-h-[42px] bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-white light:text-slate-900 focus:outline-none focus:border-amber-400 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Peak Sun Hours (PSH) Slider */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 light:text-slate-700 font-semibold text-xs">
              <Tooltip term={t.peakSunHours} content="Equivalent number of hours per day when solar irradiance equals 1,000 W/m² standard test conditions (STC)." />
            </span>
            <span className="font-mono font-bold text-amber-400 text-base">
              {location.peakSunHours.toFixed(1)} hrs/day
            </span>
          </div>
          <input
            type="range"
            min="2.0"
            max="8.0"
            step="0.1"
            value={location.peakSunHours}
            onChange={(e) => onUpdateLocation({ ...location, peakSunHours: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-700 rounded-lg my-1"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>2.0 h (Sub-arctic)</span>
            <span>5.5 h (Sahel / Tropics)</span>
            <span>8.0 h (Desert)</span>
          </div>
        </div>

        {/* Panel Orientation Efficiency */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 light:text-slate-700 font-semibold text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <Tooltip term={t.panelOrientation} content={t.panelOrientationHelp} />
            </span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              {Math.round(solar.orientationEfficiency * 100)}% {t.efficiency}
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            step="5"
            value={Math.round(solar.orientationEfficiency * 100)}
            onChange={(e) => onUpdateSolar({ ...solar, orientationEfficiency: parseInt(e.target.value) / 100 })}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-700 rounded-lg my-1"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>40% (Flat/Shaded)</span>
            <span>85% (East-West)</span>
            <span>100% (Optimal True South/North)</span>
          </div>
        </div>

        {/* Cloudy-Day Buffer */}
        <div className="p-3.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 light:text-slate-700 font-semibold text-xs flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <Tooltip term={t.cloudyDaysBuffer} content={t.cloudyBufferHelp} />
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold">
              +{location.cloudyDaysBuffer} {location.cloudyDaysBuffer === 1 ? t.day : t.days}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { days: 0, label: t.none },
              { days: 1, label: t.cloudyDay1 },
              { days: 2, label: t.cloudyDays2 },
              { days: 3, label: t.cloudyDays3 },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => onUpdateLocation({ ...location, cloudyDaysBuffer: option.days })}
                className={`min-h-[42px] py-2 px-2 rounded-xl text-center font-mono font-bold transition-all text-xs border ${
                  location.cloudyDaysBuffer === option.days
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-[#111e38] light:bg-slate-100 text-slate-300 light:text-slate-700 hover:bg-[#172646] light:hover:bg-slate-200 border-slate-700/60'
                }`}
              >
                {option.days === 0 ? '0' : `${option.days}d`}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Wattage & Reserve Margin (Stacked vertically on mobile, 2 cols on desktop) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 light:text-slate-700 font-semibold text-xs">
                {t.panelWattage}
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                {solar.panelWattage} W
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {panelWattageOptions.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateSolar({ ...solar, panelWattage: w })}
                  className={`min-h-[38px] py-1.5 rounded-lg font-mono text-xs font-semibold border transition-colors ${
                    solar.panelWattage === w
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                      : 'bg-[#0b1329] light:bg-slate-100 border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
                  }`}
                >
                  {w}W
                </button>
              ))}
              <div className="col-span-1">
                <input
                  type="number"
                  placeholder="Custom"
                  value={solar.panelWattage}
                  onChange={(e) => onUpdateSolar({ ...solar, panelWattage: Math.max(50, parseInt(e.target.value) || 400) })}
                  className="w-full min-h-[38px] py-1.5 px-1 text-center font-mono text-xs bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded-lg text-white light:text-slate-900 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 light:text-slate-700 font-semibold text-xs">
                <Tooltip term={t.reserveMargin} content="Extra PV capacity to compensate for dusty panels, cloudy mornings, or future load growth." />
              </span>
              <span className="font-mono text-emerald-400 font-bold text-base">
                +{Math.round(solar.reserveMargin * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={Math.round(solar.reserveMargin * 100)}
              onChange={(e) => onUpdateSolar({ ...solar, reserveMargin: parseInt(e.target.value) / 100 })}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-700 rounded-lg my-2"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0% (Tight)</span>
              <span>20% (Recommended)</span>
              <span>50% (High Growth)</span>
            </div>
          </div>
        </div>

        {/* Dedicated SOLAR DESIGN Result Card (Requirement 7) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-[#0b1329] to-[#0b1329] border border-emerald-500/30 text-slate-200 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              SOLAR DESIGN
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {results.panelCount} × {results.panelWattage}W
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Installed Capacity:</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {(results.actualArrayWatts / 1000).toFixed(1)} kW
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">Estimated production:</span>
            <span className="font-bold text-white light:text-slate-900">
              {results.dailySolarGenerationKwh} kWh/day
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">Installed margin:</span>
            <span className="font-bold text-emerald-400">
              +{results.actualInstalledSolarMargin}%
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Electrical:</span>
            <span className="text-slate-300 light:text-slate-700 font-semibold">
              {results.stringDesign ? `${results.stringDesign.parallelStrings} strings × ${results.stringDesign.panelsPerString} panels` : `${results.panelCount} panels`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
