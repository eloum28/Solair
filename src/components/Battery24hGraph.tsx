import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Activity, Zap, Sun, ShieldAlert, Info, CloudRain, Moon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CalculationResults, SimulationConfig, SimulationMode } from '../types/solar';
import { Translations } from '../lib/translations';

interface Battery24hGraphProps {
  results: CalculationResults;
  isDark: boolean;
  t: Translations;
  onOpenAudit?: (auditKey: string) => void;
  simulationConfig?: SimulationConfig;
  onUpdateSimulation?: (cfg: SimulationConfig) => void;
}

export const Battery24hGraph: React.FC<Battery24hGraphProps> = ({
  results,
  isDark,
  t,
  onOpenAudit,
  simulationConfig,
  onUpdateSimulation,
}) => {
  const [viewMode, setViewMode] = useState<'soc' | 'power'>('soc');
  const { 
    hourlyProfile, 
    minSocReached, 
    maxSocReached, 
    recommendedMinSocPercent, 
    criticalMinSocPercent,
    flowSummary,
    simulationMode = 'typical',
    cloudyFactor = 0.30,
  } = results;

  const currentMode = simulationConfig?.mode || simulationMode;
  const currentCloudyFactor = simulationConfig?.cloudyFactor ?? cloudyFactor;

  const handleSetMode = (mode: SimulationMode) => {
    if (onUpdateSimulation) {
      onUpdateSimulation({
        mode,
        cloudyFactor: currentCloudyFactor,
        hours: 24,
      });
    }
  };

  const handleSetCloudyFactor = (factor: number) => {
    if (onUpdateSimulation) {
      onUpdateSimulation({
        mode: 'cloudy',
        cloudyFactor: factor,
        hours: 24,
      });
    }
  };

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl mb-6 transition-colors">
      
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {t.battery24hCycle}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
            Dynamic 24h energy flow simulation: Solar PV generation vs household consumption & battery cycling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => onOpenAudit('autonomy')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono mr-2"
            >
              <span>Audit Autonomy</span>
            </button>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-0.5 bg-[#0b1329] light:bg-slate-100 border border-slate-700/60 light:border-slate-300 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('soc')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'soc'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 light:text-slate-600 hover:text-white'
              }`}
            >
              SOC Level (%)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('power')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'power'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 light:text-slate-600 hover:text-white'
              }`}
            >
              Solar vs Load (W)
            </button>
          </div>
        </div>
      </div>

      {/* Selectable Simulation Modes (Requirement 3: Typical, Cloudy, No-Sun Autonomy) */}
      <div className="mb-4 p-3 rounded-xl bg-[#0b1329]/70 light:bg-slate-50 border border-slate-800 light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-semibold flex items-center gap-1.5">
            <span>Simulation Meteorological Mode:</span>
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleSetMode('typical')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all border ${
                currentMode === 'typical'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-[#111e38] light:bg-white border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Typical Solar Day ({results.designPSH} PSH)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('cloudy')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all border ${
                currentMode === 'cloudy'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[#111e38] light:bg-white border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Cloudy Day ({Math.round(currentCloudyFactor * 100)}% PV)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('nosun')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all border ${
                currentMode === 'nosun'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'bg-[#111e38] light:bg-white border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700 hover:bg-[#172646]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>No-Sun Autonomy (0 Wh Solar)</span>
            </button>
          </div>
        </div>

        {/* Mode Specific Config / Explanation Banners */}
        {currentMode === 'cloudy' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 light:border-slate-200 text-xs">
            <div className="text-slate-300 light:text-slate-700">
              Normal PV: <strong className="text-amber-400">{results.dailySolarGenerationKwh} kWh</strong> → Cloudy PV (factor {Math.round(currentCloudyFactor * 100)}%): <strong className="text-cyan-400">{(results.dailySolarGenerationKwh * currentCloudyFactor).toFixed(1)} kWh</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Cloud Factor:</span>
              {[0.15, 0.30, 0.45, 0.60].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSetCloudyFactor(f)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                    Math.abs(currentCloudyFactor - f) < 0.05
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-[#111e38] light:bg-slate-100 text-slate-400 border-slate-700'
                  }`}
                >
                  {Math.round(f * 100)}%{f === 0.30 ? ' (Std)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentMode === 'nosun' && (
          <div className="pt-2 border-t border-slate-800/80 light:border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-slate-300 light:text-slate-700">
              Validating <strong className="text-white light:text-slate-900">{results.effectiveTargetAutonomyDays} day target autonomy</strong> with <strong className="text-purple-400">0 Wh solar production</strong>. Battery starts at 100% and discharges across 24h.
            </div>
            <div className="font-mono text-xs flex items-center gap-1.5">
              <span>Ending SOC at Hour 24:</span>
              <strong className={minSocReached >= recommendedMinSocPercent ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {flowSummary ? flowSummary.endingSoc : minSocReached}%
              </strong>
              <span className="text-slate-400">({recommendedMinSocPercent}% floor)</span>
              {minSocReached >= recommendedMinSocPercent ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Autonomy Validated ✓</span>
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Deep Discharge Risk</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">{t.minSoc}</span>
          <span
            className={`font-mono font-bold text-base ${
              minSocReached >= recommendedMinSocPercent ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {minSocReached}%
          </span>
          <span className="text-[10px] text-slate-400 block">
            {minSocReached >= recommendedMinSocPercent ? '✓ Above Reserve Floor' : '⚠ Below Design Floor'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">
            {currentMode === 'nosun' ? 'Ending 24h SOC' : t.maxSoc}
          </span>
          <span className="font-mono font-bold text-base text-teal-400">
            {currentMode === 'nosun' ? (flowSummary?.endingSoc ?? minSocReached) : maxSocReached}%
          </span>
          <span className="text-[10px] text-slate-400 block">
            {currentMode === 'nosun' ? 'After 24h zero sun' : 'Peak Solar Charge'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Recommended Reserve</span>
          <span className="font-mono font-bold text-base text-amber-400">
            {recommendedMinSocPercent}%
          </span>
          <span className="text-[10px] text-slate-400 block">Design Floor ({Math.round(results.batteryDoD * 100)}% DoD)</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Critical Reserve</span>
          <span className="font-mono font-bold text-base text-rose-400">
            {criticalMinSocPercent}%
          </span>
          <span className="text-[10px] text-slate-400 block">Emergency Cutoff Zone</span>
        </div>
      </div>

      {/* Chart Canvas (Requirement 11: 240-280px mobile, 280-320px tablet, 320-380px desktop) */}
      <div className="h-64 sm:h-72 md:h-80 lg:h-88 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'soc' ? (
            <AreaChart data={hourlyProfile} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis
                dataKey="timeLabel"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={10}
                tickLine={false}
                interval={3}
              />
              <YAxis
                domain={[0, 100]}
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={10}
                unit="%"
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-200 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                        <div className="font-bold text-slate-300 light:text-slate-800 border-b border-slate-800 pb-1 mb-1">
                          {label} (Hour {data.timeIndex}:00)
                        </div>
                        <div className="text-emerald-400">
                          State of Charge: <strong>{data.batterySoc}%</strong>
                        </div>
                        <div className="text-slate-400">
                          Stored Energy: {data.storedBatteryWh.toLocaleString()} Wh
                        </div>
                        <div className="text-amber-400">
                          Solar Output: {data.solarGenerationW} W
                        </div>
                        <div className="text-cyan-400">
                          Load Demand: {data.loadW} W
                        </div>
                        <div className={data.netEnergyWh >= 0 ? 'text-emerald-300' : 'text-slate-400'}>
                          Net Flow: {data.netEnergyWh > 0 ? `+${data.netEnergyWh}` : data.netEnergyWh} Wh
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Recommended Reserve Floor Line */}
              <ReferenceLine
                y={recommendedMinSocPercent}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Floor (${recommendedMinSocPercent}%)`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
              {/* Critical Reserve Line */}
              <ReferenceLine
                y={criticalMinSocPercent}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                label={{
                  value: `Crit (${criticalMinSocPercent}%)`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="batterySoc"
                name="Battery SOC"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#socGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={hourlyProfile} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis
                dataKey="timeLabel"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={10}
                tickLine={false}
                interval={3}
              />
              <YAxis
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={11}
                unit="W"
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-200 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                        <div className="font-bold text-slate-300 light:text-slate-800 border-b border-slate-800 pb-1 mb-1">
                          {label}
                        </div>
                        <div className="text-amber-400">
                          Solar PV Generation: <strong>{data.solarGenerationW} W</strong>
                        </div>
                        <div className="text-cyan-400">
                          Household Load: <strong>{data.loadW} W</strong>
                        </div>
                        <div className="text-emerald-400">
                          Battery SOC: {data.batterySoc}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="solarGenerationW"
                name="Solar Production (W)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#solarGrad)"
              />
              <Area
                type="monotone"
                dataKey="loadW"
                name="Household Load (W)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#loadGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 light:text-slate-500 mt-2 pt-2 border-t border-slate-800/60 light:border-slate-100">
        <span>🌙 19:00 - 06:00: Pure battery discharge</span>
        <span>☀ 07:00 - 18:00: Solar direct-power + battery bulk/absorb charging</span>
      </div>
    </div>
  );
};
