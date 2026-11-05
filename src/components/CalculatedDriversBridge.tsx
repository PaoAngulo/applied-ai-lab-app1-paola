import React from 'react';
import { CalculatedSalesData } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/salesCalculator';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Percent,
  Radio,
  Boxes,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CalculatedDriversBridgeProps {
  calculatedData: CalculatedSalesData;
}

export const CalculatedDriversBridge: React.FC<CalculatedDriversBridgeProps> = ({
  calculatedData,
}) => {
  const topMetrics = calculatedData.topRegionMetrics;
  const isGrowth = topMetrics.dollarDelta >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#003893]">
              <Compass className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Calculated Q2 → Q3 Variance Drivers for "{topMetrics.region}"
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            The quantitative calculations explaining why {topMetrics.region} shifted by{' '}
            <strong className={isGrowth ? 'text-emerald-700' : 'text-[#CE1126]'}>
              {formatCurrency(topMetrics.dollarDelta)} ({formatPercent(topMetrics.pctDelta)})
            </strong>
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#003893]" />
          <span>Source of Truth for AI Summary</span>
        </div>
      </div>

      {/* 4 Pillars of Change Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* 1. Net Revenue Shift */}
        <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              1. Total Revenue Shift
            </span>
            {isGrowth ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#CE1126]" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`text-xl font-extrabold font-mono ${
                isGrowth ? 'text-emerald-700' : 'text-[#CE1126]'
              }`}
            >
              {isGrowth ? '+' : ''}
              {formatCurrency(topMetrics.dollarDelta)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              ({formatPercent(topMetrics.pctDelta)})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{formatCurrency(topMetrics.q2Revenue)} (Q2)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-700">
              {formatCurrency(topMetrics.q3Revenue)} (Q3)
            </span>
          </p>
        </div>

        {/* 2. Unit Volume Driver */}
        <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              2. Unit Volume Driver
            </span>
            <Package className="w-4 h-4 text-[#003893]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`text-xl font-extrabold font-mono ${
                topMetrics.unitsDelta >= 0 ? 'text-[#003893]' : 'text-[#CE1126]'
              }`}
            >
              {topMetrics.unitsDelta >= 0 ? '+' : ''}
              {topMetrics.unitsDelta.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">
              ({formatPercent(topMetrics.unitsPctDelta)})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{topMetrics.q2Units.toLocaleString()} units</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-700">
              {topMetrics.q3Units.toLocaleString()} units
            </span>
          </p>
        </div>

        {/* 3. Discount Rate & Net Realization */}
        <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              3. Discount & Pricing
            </span>
            <Percent className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-extrabold font-mono text-slate-800">
              {topMetrics.discountDeltaPoints >= 0 ? '+' : ''}
              {topMetrics.discountDeltaPoints.toFixed(1)} pts
            </span>
            <span className="text-xs text-slate-500">rate shift</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{topMetrics.q2AvgDiscountPct.toFixed(1)}% (Q2)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-700">
              {topMetrics.q3AvgDiscountPct.toFixed(1)}% (Q3)
            </span>
          </p>
        </div>

        {/* 4. Net Revenue Per Unit */}
        <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              4. Realization / Unit
            </span>
            <Radio className="w-4 h-4 text-[#CE1126]" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-extrabold font-mono text-slate-800">
              {topMetrics.revPerUnitDelta >= 0 ? '+' : ''}
              {formatCurrency(topMetrics.revPerUnitDelta)}
            </span>
            <span className="text-xs text-slate-500">per unit</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{formatCurrency(topMetrics.q2RevPerUnit)}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-700">
              {formatCurrency(topMetrics.q3RevPerUnit)}
            </span>
          </p>
        </div>
      </div>

      {/* Channel and Product Drivers Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 pt-4 border-t border-slate-100">
        {/* Channel Breakdown */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#003893]" />
              Channel Performance (Q2 → Q3)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Top: <strong>{topMetrics.topChannel?.name || 'N/A'}</strong>
            </span>
          </div>

          <div className="space-y-2">
            {topMetrics.channels.map((ch) => {
              const chGrowth = ch.delta >= 0;
              return (
                <div
                  key={ch.name}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{ch.name}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">
                      {formatCurrency(ch.q2Revenue)} → {formatCurrency(ch.q3Revenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        chGrowth ? 'text-emerald-700' : 'text-[#CE1126]'
                      }`}
                    >
                      {chGrowth ? '+' : ''}
                      {formatCurrency(ch.delta)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({formatPercent(ch.pctDelta)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-[#CE1126]" />
              Product Performance (Q2 → Q3)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Top: <strong>{topMetrics.topProduct?.name || 'N/A'}</strong>
            </span>
          </div>

          <div className="space-y-2">
            {topMetrics.channels.map((ch) => {
              const chGrowth = ch.delta >= 0;
              return (
                <div
                  key={ch.name}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{ch.name}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">
                      {formatCurrency(ch.q2Revenue)} → {formatCurrency(ch.q3Revenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        chGrowth ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {chGrowth ? '+' : ''}
                      {formatCurrency(ch.delta)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({formatPercent(ch.pctDelta)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-violet-600" />
              Product Performance (Q2 → Q3)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Top: <strong>{topMetrics.topProduct?.name || 'N/A'}</strong>
            </span>
          </div>

          <div className="space-y-2">
            {topMetrics.products.map((p) => {
              const pGrowth = p.delta >= 0;
              return (
                <div
                  key={p.name}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">
                      {formatCurrency(p.q2Revenue)} → {formatCurrency(p.q3Revenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        pGrowth ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {pGrowth ? '+' : ''}
                      {formatCurrency(p.delta)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({formatPercent(p.pctDelta)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
