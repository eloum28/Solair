import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  ToggleLeft, 
  ToggleRight, 
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Edit2,
  Check,
  Zap
} from 'lucide-react';
import { Appliance } from '../types/solar';
import { PRESET_APPLIANCES } from '../lib/presets';
import { Translations } from '../lib/translations';
import { Tooltip } from './Tooltip';

interface ApplianceEstimatorProps {
  appliances: Appliance[];
  onUpdateAppliances: (appliances: Appliance[]) => void;
  daytimeWh: number;
  nighttimeWh: number;
  daytimePercentage: number;
  nighttimePercentage: number;
  t: Translations;
}

export const ApplianceEstimator: React.FC<ApplianceEstimatorProps> = ({
  appliances,
  onUpdateAppliances,
  daytimeWh,
  nighttimeWh,
  daytimePercentage,
  nighttimePercentage,
  t,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobileAddModalOpen, setMobileAddModalOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileActiveCategory, setMobileActiveCategory] = useState('all');
  const [expandedApplianceId, setExpandedApplianceId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Presets' },
    { id: 'cooling', label: 'Cooling / HVAC' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'water', label: 'Water & Pumps' },
    { id: 'lighting', label: 'Lighting' },
  ];

  const handleAddPreset = (presetName: string) => {
    const preset = PRESET_APPLIANCES.find((p) => p.name === presetName);
    if (!preset) return;

    const newAppliance: Appliance = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      category: preset.category,
      quantity: 1,
      watts: preset.defaultWatts,
      hoursPerDay: preset.defaultHours,
      dayHours: preset.defaultDayHours,
      nightHours: preset.defaultNightHours,
      simultaneousFactor: preset.simultaneousFactor,
      surgeMultiplier: preset.surgeMultiplier,
      enabled: true,
    };

    onUpdateAppliances([...appliances, newAppliance]);
  };

  const handleAddCustom = () => {
    const newAppliance: Appliance = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: 'Custom Appliance',
      category: 'other',
      quantity: 1,
      watts: 200,
      hoursPerDay: 4,
      dayHours: 2,
      nightHours: 2,
      simultaneousFactor: 0.8,
      surgeMultiplier: 1.0,
      enabled: true,
    };

    onUpdateAppliances([...appliances, newAppliance]);
    setExpandedApplianceId(newAppliance.id);
  };

  const handleUpdateItem = (id: string, field: keyof Appliance, value: string | number | boolean) => {
    const updated = appliances.map((item) => {
      if (item.id !== id) return item;

      const next = { ...item, [field]: value };

      // Keep hours consistent: if total hours changed, keep ratio
      if (field === 'hoursPerDay') {
        const total = Math.max(0, Math.min(24, Number(value)));
        next.hoursPerDay = total;
        // Split evenly if day+night was zero
        const sum = item.dayHours + item.nightHours;
        if (sum > 0) {
          next.dayHours = Number(((item.dayHours / sum) * total).toFixed(1));
          next.nightHours = Number((total - next.dayHours).toFixed(1));
        } else {
          next.dayHours = Number((total * 0.5).toFixed(1));
          next.nightHours = Number((total * 0.5).toFixed(1));
        }
      } else if (field === 'dayHours') {
        const dayH = Math.max(0, Math.min(24, Number(value)));
        next.dayHours = dayH;
        next.hoursPerDay = Number((dayH + next.nightHours).toFixed(1));
      } else if (field === 'nightHours') {
        const nightH = Math.max(0, Math.min(24, Number(value)));
        next.nightHours = nightH;
        next.hoursPerDay = Number((next.dayHours + nightH).toFixed(1));
      }

      return next;
    });

    onUpdateAppliances(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateAppliances(appliances.filter((a) => a.id !== id));
    if (expandedApplianceId === id) {
      setExpandedApplianceId(null);
    }
  };

  const handleToggleAll = (enable: boolean) => {
    onUpdateAppliances(appliances.map((a) => ({ ...a, enabled: enable })));
  };

  const filteredPresets = selectedCategory === 'all'
    ? PRESET_APPLIANCES
    : PRESET_APPLIANCES.filter((p) => p.category === selectedCategory);

  const mobileFilteredPresets = PRESET_APPLIANCES.filter((p) => {
    const matchesCat = mobileActiveCategory === 'all' || p.category === mobileActiveCategory;
    const matchesQuery = !mobileSearchQuery.trim() || 
      p.name.toLowerCase().includes(mobileSearchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-xl mb-6 transition-colors">
      
      {/* Header & Day/Night Split Highlight */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 sm:mb-5 border-b border-slate-800/80 light:border-slate-100 pb-3 sm:pb-4">
        <div>
          <h2 className="text-base font-bold text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            {t.applianceEstimator}
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
            Enter household loads to compute continuous power, motor surge spikes, and day/night storage needs.
          </p>
        </div>

        {/* Daytime vs Nighttime summary bar */}
        <div className="bg-[#0b1329] light:bg-slate-50 p-2.5 rounded-xl border border-slate-800 light:border-slate-200 w-full sm:w-auto min-w-0 sm:min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5 flex-wrap gap-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sun className="w-3.5 h-3.5" />
              <span>Day: <strong>{daytimeWh.toLocaleString()} Wh</strong> ({daytimePercentage}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Moon className="w-3.5 h-3.5" />
              <span>Night: <strong>{nighttimeWh.toLocaleString()} Wh</strong> ({nighttimePercentage}%)</span>
            </span>
          </div>

          {/* Progress bar split */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${daytimePercentage}%` }}
              className="bg-amber-400 transition-all duration-300"
              title={`Daytime: ${daytimePercentage}%`}
            />
            <div
              style={{ width: `${nighttimePercentage}%` }}
              className="bg-cyan-500 transition-all duration-300"
              title={`Nighttime: ${nighttimePercentage}%`}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE ONLY APPLIANCE SECTION (< md / 768px)
          Per Requirements 5, 6, 7 & 8: Clean expandable cards + Modal Add
          ======================================================== */}
      <div className="block md:hidden space-y-3">
        {/* Quick Add Bar for Mobile (Requirement 6) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileAddModalOpen(true)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Appliance</span>
          </button>

          <button
            type="button"
            onClick={handleAddCustom}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0b1329] light:bg-slate-100 border border-slate-700 light:border-slate-300 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1 active:scale-[0.98] transition-all shrink-0"
            title="Create blank custom appliance"
          >
            <span>+ Custom</span>
          </button>
        </div>

        {/* Mobile Appliance Count & Toggle All */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-400 font-mono">
          <span>Active: {appliances.filter((a) => a.enabled).length} / {appliances.length} loads</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="text-emerald-400 hover:underline"
            >
              All On
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="text-slate-400 hover:text-rose-400"
            >
              All Off
            </button>
          </div>
        </div>

        {/* Mobile Expandable Appliance Cards (Requirement 5) */}
        <div className="space-y-2.5">
          {appliances.length === 0 ? (
            <div className="p-8 text-center bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300 light:text-slate-700">No appliances added yet</p>
              <p className="text-xs text-slate-500 mt-1">Tap &ldquo;+ Add Appliance&rdquo; above to select from presets or create a custom load.</p>
            </div>
          ) : (
            appliances.map((item) => {
              const isExpanded = expandedApplianceId === item.id;
              const connectedWatts = item.quantity * item.watts;
              const itemDailyWh = item.enabled ? Math.round(connectedWatts * item.hoursPerDay * item.simultaneousFactor) : 0;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    !item.enabled
                      ? 'bg-[#0b1329]/40 light:bg-slate-100/60 border-slate-800/60 opacity-60'
                      : isExpanded
                      ? 'bg-[#0d1832] light:bg-white border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-[#0b1329]/80 light:bg-slate-50 border-slate-800 light:border-slate-200'
                  }`}
                >
                  {/* Card Main Header / Summary (Always Visible) */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${item.enabled ? 'text-white light:text-slate-900' : 'text-slate-400 line-through'}`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-300 light:text-slate-600 mt-0.5">
                          <strong>{item.quantity} unit{item.quantity > 1 ? 's' : ''}</strong> × {item.watts} W
                        </div>
                      </div>

                      {/* Daily Wh Badge */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono text-emerald-400">
                          {itemDailyWh.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Wh/d</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(connectedWatts / 1000).toFixed(2)} kW conn
                        </div>
                      </div>
                    </div>

                    {/* Operational Hours Split Line */}
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 light:text-slate-500 bg-[#111e38]/70 light:bg-slate-100 p-2 rounded-lg">
                      <span>{item.hoursPerDay.toFixed(1)} hrs/day</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">{item.dayHours}h Day</span>
                        <span>|</span>
                        <span className="text-cyan-400">{item.nightHours}h Night</span>
                      </div>
                    </div>

                    {/* Action Bar (Edit ▾, Disable/Enable, Delete) */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 light:border-slate-200">
                      <button
                        type="button"
                        onClick={() => setExpandedApplianceId(isExpanded ? null : item.id)}
                        className="flex-1 min-h-[40px] px-3 rounded-xl bg-[#111e38] light:bg-slate-200 hover:bg-[#172646] text-slate-200 light:text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isExpanded ? 'Collapse' : 'Edit Specs'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateItem(item.id, 'enabled', !item.enabled)}
                        className={`min-h-[40px] px-3.5 rounded-xl font-semibold text-xs transition-colors shrink-0 ${
                          item.enabled
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        {item.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete appliance"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Form (Requirement 5) */}
                  {isExpanded && (
                    <div className="p-3.5 bg-[#080e1e] light:bg-slate-100 border-t border-slate-800 light:border-slate-200 space-y-3 text-xs">
                      {/* Name input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Appliance Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          className="w-full min-h-[42px] px-3 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl text-white light:text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* Quantity & Watts (Large inputs) */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Quantity
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              className="w-10 min-h-[42px] bg-[#111e38] light:bg-white border border-slate-700 rounded-l-xl flex items-center justify-center font-bold text-slate-300"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="200"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full min-h-[42px] text-center font-mono font-bold bg-[#0b1329] light:bg-slate-50 border-y border-slate-700 text-white light:text-slate-900 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, 'quantity', item.quantity + 1)}
                              className="w-10 min-h-[42px] bg-[#111e38] light:bg-white border border-slate-700 rounded-r-xl flex items-center justify-center font-bold text-slate-300"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Power (Watts)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="15000"
                            value={item.watts}
                            onChange={(e) => handleUpdateItem(item.id, 'watts', Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full min-h-[42px] px-3 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono font-bold text-white light:text-slate-900 text-sm focus:outline-none focus:border-emerald-400 text-right"
                          />
                        </div>
                      </div>

                      {/* Hours Split (Total, Day, Night) */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                            Total Hrs/day
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={item.hoursPerDay}
                            onChange={(e) => handleUpdateItem(item.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                            className="w-full min-h-[42px] px-2 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono text-center font-bold text-white light:text-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-amber-400 mb-1">
                            Day Hrs (PV)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={item.dayHours}
                            onChange={(e) => handleUpdateItem(item.id, 'dayHours', parseFloat(e.target.value) || 0)}
                            className="w-full min-h-[42px] px-2 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono text-center font-bold text-amber-400 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-cyan-400 mb-1">
                            Night Hrs (Batt)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={item.nightHours}
                            onChange={(e) => handleUpdateItem(item.id, 'nightHours', parseFloat(e.target.value) || 0)}
                            className="w-full min-h-[42px] px-2 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono text-center font-bold text-cyan-400 text-sm"
                          />
                        </div>
                      </div>

                      {/* Simultaneous % & Surge Multiplier */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Simultaneous %
                          </label>
                          <select
                            value={item.simultaneousFactor}
                            onChange={(e) => handleUpdateItem(item.id, 'simultaneousFactor', parseFloat(e.target.value))}
                            className="w-full min-h-[42px] px-2 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono text-white light:text-slate-900 text-sm"
                          >
                            <option value={1.0}>100% (Always)</option>
                            <option value={0.9}>90%</option>
                            <option value={0.8}>80% (Typical)</option>
                            <option value={0.7}>70%</option>
                            <option value={0.6}>60%</option>
                            <option value={0.5}>50%</option>
                            <option value={0.3}>30% (Intermittent)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Motor Surge
                          </label>
                          <select
                            value={item.surgeMultiplier}
                            onChange={(e) => handleUpdateItem(item.id, 'surgeMultiplier', parseFloat(e.target.value))}
                            className="w-full min-h-[42px] px-2 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded-xl font-mono text-white light:text-slate-900 text-sm"
                          >
                            <option value={1.0}>1.0× (None/LED)</option>
                            <option value={1.5}>1.5× (Electronics)</option>
                            <option value={2.0}>2.0× (Small Motor)</option>
                            <option value={3.0}>3.0× (Fridge/Pumps)</option>
                            <option value={4.0}>4.0× (AC Compressor)</option>
                            <option value={5.0}>5.0× (Heavy Inrush)</option>
                          </select>
                        </div>
                      </div>

                      {/* Done button */}
                      <button
                        type="button"
                        onClick={() => setExpandedApplianceId(null)}
                        className="w-full min-h-[42px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Done Editing</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          DESKTOP APPLIANCE SECTION (>= md / 768px)
          Preserved Engineering Table with Sticky Columns
          ======================================================== */}
      <div className="hidden md:block">
        {/* Preset Appliances Picker */}
        <div className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
              {t.quickAddPresets}:
            </span>
            
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-[#0b1329] light:bg-slate-100 rounded-lg text-xs overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap text-[11px] font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {filteredPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset.name)}
                className="px-2.5 py-1 text-xs rounded-lg bg-[#0b1329] light:bg-slate-50 hover:bg-[#172646] light:hover:bg-slate-200 text-slate-200 light:text-slate-800 border border-slate-800 light:border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({preset.defaultWatts}W)</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addCustomAppliance}</span>
            </button>
          </div>
        </div>

        {/* Appliance Load Table with Internal Scroll and Sticky Columns */}
        <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[460px] rounded-xl border border-slate-800 light:border-slate-200 relative">
          <table className="w-full text-left text-xs border-collapse min-w-[760px] lg:min-w-full">
            <thead className="sticky top-0 z-20 bg-[#0b1329] light:bg-slate-100 border-b border-slate-800 light:border-slate-200 shadow-sm">
              <tr className="text-slate-400 light:text-slate-600 font-mono">
                <th className="py-2.5 px-3 font-semibold text-center w-10 sticky left-0 z-30 bg-[#0b1329] light:bg-slate-100">On</th>
                <th className="py-2.5 px-3 font-semibold min-w-[150px] sm:min-w-[180px] sticky left-10 z-30 bg-[#0b1329] light:bg-slate-100 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">{t.applianceName}</th>
                <th className="py-2.5 px-2 font-semibold text-right w-16">{t.quantity}</th>
                <th className="py-2.5 px-2 font-semibold text-right w-20">
                  <Tooltip term={t.watts} content="Nominal electrical power drawn when running at standard load." />
                </th>
                <th className="py-2.5 px-2 font-semibold text-right w-16">{t.hoursPerDay}</th>
                <th className="py-2.5 px-2 font-semibold text-right w-16 text-amber-400">
                  <Tooltip term={t.daytimeHours} content="Operating hours between 07:00 and 19:00 powered directly by solar PV." />
                </th>
                <th className="py-2.5 px-2 font-semibold text-right w-16 text-cyan-400">
                  <Tooltip term={t.nighttimeHours} content="Operating hours between 19:00 and 07:00 powered by the battery bank." />
                </th>
                <th className="py-2.5 px-2 font-semibold text-right w-20">
                  <Tooltip term={t.simultaneousFactor} content="Likelihood of this appliance operating concurrently with others (0.1 to 1.0)." />
                </th>
                <th className="py-2.5 px-2 font-semibold text-right w-16">
                  <Tooltip term={t.surgeMultiplier} content="Inrush current factor for motor/compressor starting (e.g. 3× to 5× for AC/Fridges/Pumps, 1× for lights)." />
                </th>
                <th className="py-2.5 px-3 font-semibold text-right min-w-[90px]">{t.dailyWh}</th>
                <th className="py-2.5 px-2 text-center w-10">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {appliances.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 light:text-slate-500">
                    {t.emptyAppliancesMsg}
                  </td>
                </tr>
              ) : (
                appliances.map((item) => {
                  const itemWh = item.enabled ? item.quantity * item.watts * item.hoursPerDay : 0;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#172646]/40 light:hover:bg-slate-50 transition-colors ${
                        !item.enabled ? 'opacity-40 bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Enable Toggle (Sticky Column 1) */}
                      <td className="py-2 px-3 text-center sticky left-0 z-10 bg-[#111e38] light:bg-white">
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(item.id, 'enabled', !item.enabled)}
                          className="text-slate-400 hover:text-white"
                          aria-label={item.enabled ? 'Disable' : 'Enable'}
                        >
                          {item.enabled ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Name (Sticky Column 2) */}
                      <td className="py-2 px-3 sticky left-10 z-10 bg-[#111e38] light:bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-emerald-400 text-white light:text-slate-900 font-medium focus:outline-none py-0.5 text-xs"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-right font-mono text-white light:text-slate-900 focus:outline-none focus:border-emerald-400"
                        />
                      </td>

                      {/* Watts */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          max="15000"
                          value={item.watts}
                          onChange={(e) => handleUpdateItem(item.id, 'watts', Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-18 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-right font-mono text-white light:text-slate-900 focus:outline-none focus:border-emerald-400"
                        />
                      </td>

                      {/* Total Hours */}
                      <td className="py-2 px-2 text-right font-mono font-medium text-slate-300 light:text-slate-700">
                        {item.hoursPerDay.toFixed(1)}
                      </td>

                      {/* Day Hours */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={item.dayHours}
                          onChange={(e) => handleUpdateItem(item.id, 'dayHours', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1 py-0.5 text-right font-mono text-amber-400 focus:outline-none focus:border-emerald-400"
                        />
                      </td>

                      {/* Night Hours */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={item.nightHours}
                          onChange={(e) => handleUpdateItem(item.id, 'nightHours', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1 py-0.5 text-right font-mono text-cyan-400 focus:outline-none focus:border-emerald-400"
                        />
                      </td>

                      {/* Simultaneous Factor */}
                      <td className="py-2 px-2 text-right">
                        <select
                          value={item.simultaneousFactor}
                          onChange={(e) => handleUpdateItem(item.id, 'simultaneousFactor', parseFloat(e.target.value))}
                          className="w-18 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1 py-0.5 text-right font-mono text-slate-300 light:text-slate-700 focus:outline-none focus:border-emerald-400"
                        >
                          <option value={1.0}>100%</option>
                          <option value={0.9}>90%</option>
                          <option value={0.8}>80%</option>
                          <option value={0.7}>70%</option>
                          <option value={0.6}>60%</option>
                          <option value={0.5}>50%</option>
                          <option value={0.4}>40%</option>
                        </select>
                      </td>

                      {/* Surge Multiplier */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          step="0.5"
                          value={item.surgeMultiplier}
                          onChange={(e) => handleUpdateItem(item.id, 'surgeMultiplier', Math.max(1, parseFloat(e.target.value) || 1))}
                          className="w-14 bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1 py-0.5 text-right font-mono text-slate-300 light:text-slate-700 focus:outline-none focus:border-emerald-400"
                        />
                      </td>

                      {/* Daily Wh Result */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-white light:text-slate-900">
                        {itemWh.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Wh</span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-2 text-xs text-slate-400 light:text-slate-500">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Enable All
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="hover:text-rose-400 transition-colors"
            >
              Disable All
            </button>
          </div>
          <div className="font-mono text-slate-300 light:text-slate-700">
            Active Loads: {appliances.filter((a) => a.enabled).length} / {appliances.length}
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE ADD APPLIANCE BOTTOM SHEET / MODAL (Requirement 6)
          Categorized, searchable, large touch targets
          ======================================================== */}
      {mobileAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#111e38] light:bg-white border-t sm:border border-slate-700 light:border-slate-300 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 light:border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <h3 className="text-base font-bold text-white light:text-slate-900">
                  Add Appliance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileAddModalOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800/80 light:border-slate-100 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search appliances..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-8 bg-[#0b1329] light:bg-slate-100 border border-slate-700 light:border-slate-300 rounded-xl text-white light:text-slate-900 text-sm focus:outline-none focus:border-emerald-400"
                />
                {mobileSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMobileSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills inside Modal */}
              <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 no-scrollbar">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setMobileActiveCategory(c.id)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      mobileActiveCategory === c.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-[#172646] light:bg-slate-100 border-slate-700/60 light:border-slate-300 text-slate-300 light:text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets List in Modal */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {mobileFilteredPresets.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No matching appliances found for &ldquo;{mobileSearchQuery}&rdquo;
                </div>
              ) : (
                mobileFilteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      handleAddPreset(preset.name);
                      setMobileAddModalOpen(false);
                    }}
                    className="w-full min-h-[48px] p-3 rounded-xl bg-[#0b1329] light:bg-slate-50 hover:bg-[#172646] light:hover:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between text-left transition-colors active:scale-[0.99]"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white light:text-slate-900 text-sm truncate">
                        {preset.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {preset.defaultWatts} W · {preset.defaultHours} hrs/d ({preset.defaultDayHours}h Day / {preset.defaultNightHours}h Night)
                      </div>
                    </div>
                    <div className="min-h-[34px] px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3 border-t border-slate-800 light:border-slate-200 bg-[#0b1329] light:bg-slate-50 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleAddCustom();
                  setMobileAddModalOpen(false);
                }}
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Custom Appliance</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileAddModalOpen(false)}
                className="min-h-[44px] px-5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
