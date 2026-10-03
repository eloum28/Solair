import React, { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp, ShoppingBag, Truck, Wrench } from 'lucide-react';
import { CostConfig, CalculationResults, CurrencyCode } from '../types/solar';
import { Translations } from '../lib/translations';

interface MarketPricesProps {
  costs: CostConfig;
  onUpdateCosts: (costs: CostConfig) => void;
  results: CalculationResults;
  t: Translations;
}

export const MarketPrices: React.FC<MarketPricesProps> = ({
  costs,
  onUpdateCosts,
  results,
  t,
}) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const currencySymbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    XOF: 'FCFA ',
  };

  const handleCurrencyChange = (curr: CurrencyCode) => {
    let defaultRate = 1.0;
    if (curr === 'EUR') defaultRate = 0.92;
    if (curr === 'XOF') defaultRate = 610;

    onUpdateCosts({
      ...costs,
      currency: curr,
      exchangeRateToUSD: defaultRate,
    });
  };

  const handlePriceFieldChange = (field: keyof CostConfig, val: number) => {
    onUpdateCosts({
      ...costs,
      [field]: val,
    });
  };

  const sym = currencySymbols[costs.currency];
  const fmt = (v: number) => new Intl.NumberFormat().format(Math.round(v));

  return (
    <div className="bg-[#111e38] light:bg-white border border-[#1e3a5f] light:border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          {t.marketPrices}
        </h3>
        <span className="text-xs font-mono font-bold text-emerald-400">
          {sym}{fmt(results.costs.grandTotal)}
        </span>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Currency & Exchange Rate Bar */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0b1329]/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
          <div>
            <span className="text-slate-400 block mb-1 font-semibold">{t.currency}</span>
            <div className="grid grid-cols-3 gap-1">
              {(['USD', 'EUR', 'XOF'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCurrencyChange(c)}
                  className={`py-1 rounded font-mono font-bold text-xs border transition-colors ${
                    costs.currency === c
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-[#111e38] light:bg-white border-slate-700 light:border-slate-300 text-slate-300 light:text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1 font-semibold">{t.exchangeRate}</span>
            <input
              type="number"
              step="0.01"
              value={costs.exchangeRateToUSD}
              onChange={(e) => handlePriceFieldChange('exchangeRateToUSD', parseFloat(e.target.value) || 1)}
              className="w-full bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-300 rounded px-2.5 py-1 text-white light:text-slate-900 font-mono text-xs"
            />
          </div>
        </div>

        {/* Primary Equipment Pricing Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Solar Panel Unit</span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-slate-500 font-mono">{sym}</span>
              <input
                type="number"
                value={costs.panelUnitPrice}
                onChange={(e) => handlePriceFieldChange('panelUnitPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded pl-6 pr-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Battery Unit</span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-slate-500 font-mono">{sym}</span>
              <input
                type="number"
                value={costs.batteryUnitPrice}
                onChange={(e) => handlePriceFieldChange('batteryUnitPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded pl-6 pr-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Inverter Unit</span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-slate-500 font-mono">{sym}</span>
              <input
                type="number"
                value={costs.inverterUnitPrice}
                onChange={(e) => handlePriceFieldChange('inverterUnitPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded pl-6 pr-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">MPPT Unit</span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-slate-500 font-mono">{sym}</span>
              <input
                type="number"
                value={costs.mpptUnitPrice}
                onChange={(e) => handlePriceFieldChange('mpptUnitPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded pl-6 pr-2 py-1 text-white light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Secondary Hardware & Services Pricing */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block truncate">Mounting</span>
            <input
              type="number"
              value={costs.mountingCost}
              onChange={(e) => handlePriceFieldChange('mountingCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block truncate">DC Protection</span>
            <input
              type="number"
              value={costs.dcProtectionCost}
              onChange={(e) => handlePriceFieldChange('dcProtectionCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block truncate">AC Protection</span>
            <input
              type="number"
              value={costs.acProtectionCost}
              onChange={(e) => handlePriceFieldChange('acProtectionCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block truncate">Cables</span>
            <input
              type="number"
              value={costs.cablesCost}
              onChange={(e) => handlePriceFieldChange('cablesCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block truncate">Labor/Install</span>
            <input
              type="number"
              value={costs.installationCost}
              onChange={(e) => handlePriceFieldChange('installationCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block truncate">Shipping</span>
            <input
              type="number"
              value={costs.shippingCost}
              onChange={(e) => handlePriceFieldChange('shippingCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b1329] light:bg-white border border-slate-700 light:border-slate-300 rounded px-1.5 py-0.5 text-white light:text-slate-900 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Collapsible VIEW COST BREAKDOWN Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="w-full py-2 px-3 rounded-xl bg-[#0b1329] light:bg-slate-100 hover:bg-[#172646] light:hover:bg-slate-200 border border-slate-700/60 light:border-slate-300 flex items-center justify-between text-xs font-semibold text-slate-200 light:text-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.costBreakdown}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-emerald-400">{sym}{fmt(results.costs.grandTotal)}</span>
              {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isBreakdownOpen && (
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 light:border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0b1329] light:bg-slate-100 border-b border-slate-800 light:border-slate-200 font-mono text-slate-400 light:text-slate-600">
                    <th className="py-2 px-3 font-semibold">{t.item}</th>
                    <th className="py-2 px-2 text-right font-semibold">Qty</th>
                    <th className="py-2 px-2 text-right font-semibold">{t.unitPrice}</th>
                    <th className="py-2 px-3 text-right font-semibold">{t.subtotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {results.costs.items.map((row) => (
                    <tr key={row.itemKey} className="hover:bg-[#172646]/30 light:hover:bg-slate-50 font-mono">
                      <td className="py-1.5 px-3 font-sans text-slate-300 light:text-slate-700">
                        {row.name}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-400">
                        {row.quantity}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-400">
                        {sym}{fmt(row.unitPrice)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-white light:text-slate-900">
                        {sym}{fmt(row.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0b1329]/80 light:bg-slate-100 font-mono font-semibold border-t border-slate-700">
                    <td colSpan={3} className="py-2 px-3 text-slate-300 light:text-slate-700">
                      {t.equipmentSubtotal}
                    </td>
                    <td className="py-2 px-3 text-right text-teal-400">
                      {sym}{fmt(results.costs.equipmentSubtotal)}
                    </td>
                  </tr>
                  <tr className="bg-[#0b1329]/80 light:bg-slate-100 font-mono font-semibold">
                    <td colSpan={3} className="py-1.5 px-3 text-slate-300 light:text-slate-700">
                      {t.installationSubtotal}
                    </td>
                    <td className="py-1.5 px-3 text-right text-blue-400">
                      {sym}{fmt(results.costs.installationSubtotal)}
                    </td>
                  </tr>
                  <tr className="bg-[#0b1329]/80 light:bg-slate-100 font-mono font-semibold">
                    <td colSpan={3} className="py-1.5 px-3 text-slate-300 light:text-slate-700">
                      {t.logisticsSubtotal}
                    </td>
                    <td className="py-1.5 px-3 text-right text-purple-400">
                      {sym}{fmt(results.costs.logisticsSubtotal)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-950/40 light:bg-emerald-50 font-mono font-bold text-sm border-t-2 border-emerald-500">
                    <td colSpan={3} className="py-2.5 px-3 text-emerald-400 light:text-emerald-700 font-sans">
                      {t.grandTotal}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 light:text-emerald-700">
                      {sym}{fmt(results.costs.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
