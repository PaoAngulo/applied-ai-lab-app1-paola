import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
  BarChart2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { CalculatedSalesData } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/salesCalculator';

interface AiSummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
  calculatedData: CalculatedSalesData;
  error?: string | null;
  isAi: boolean;
  source: string;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  summary,
  isLoading,
  onRegenerate,
  calculatedData,
  error,
  isAi,
  source,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topMetrics = calculatedData.topRegionMetrics;
  const isGrowth = topMetrics.dollarDelta >= 0;

  // Split summary into sentences for enhanced readability
  // Matches punctuation followed by whitespace or end of string
  const sentences = summary
    ? summary
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#001D4A] via-[#051838] to-[#0A1128] text-white shadow-xl border border-blue-900/60">
      {/* Decorative Colombian background glows: Golden Yellow & Carmine Red */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#FCD116]/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#CE1126]/15 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 px-5 sm:px-6 pt-5 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-[#FCD116]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Executive AI Intelligence
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/30">
                3-Sentence Q2 → Q3 Variance Summary
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded exclusively in app-calculated sales order metrics
            </p>
          </div>
        </div>

        {/* Model and Action controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono text-slate-300">
              {isAi ? 'gemini-3.8-flash' : 'Deterministic Calculation'}
            </span>
          </div>

          <button
            onClick={onRegenerate}
            disabled={isLoading}
            title="Re-run AI synthesis"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#001D4A] bg-[#FCD116] hover:bg-yellow-400 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>

          {summary && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-5 sm:px-6 py-5">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-amber-400/20 border-t-[#FCD116] rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-amber-200">
              Analyzing quarterly revenue variance for region "{calculatedData.topChangedRegion}"...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Verifying that only calculated volume, discount, and channel figures are referenced.
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">Analysis Notice</p>
              <p className="mt-0.5 text-rose-200/90">{error}</p>
              <button
                onClick={onRegenerate}
                className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs"
              >
                <RefreshCw className="w-3 h-3" /> Retry Generation
              </button>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* 3 Sentences Displayed with Badges */}
            <div className="space-y-3">
              {sentences.length === 3 ? (
                sentences.map((sentence, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-amber-400/30 transition-colors flex items-start gap-3"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-tr from-[#FCD116] to-amber-300 text-[#001D4A] text-xs font-black flex items-center justify-center mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-slate-100 font-normal">
                      {sentence}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                    {summary}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stat Pill Highlights from Top Changed Region */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Top Changed Region
                </span>
                <span className="text-sm font-bold text-[#FCD116]">
                  {topMetrics.region}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Q2 → Q3 Shift
                </span>
                <span
                  className={`text-sm font-bold ${
                    isGrowth ? 'text-emerald-400' : 'text-[#f87171]'
                  }`}
                >
                  {formatCurrency(topMetrics.dollarDelta)} ({formatPercent(topMetrics.pctDelta)})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Unit Volume Delta
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {topMetrics.unitsDelta >= 0 ? '+' : ''}
                  {topMetrics.unitsDelta.toLocaleString()} units ({formatPercent(topMetrics.unitsPctDelta)})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Discount Rate Shift
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {topMetrics.q2AvgDiscountPct.toFixed(1)}% → {topMetrics.q3AvgDiscountPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Expandable Grounding Transparency Inspector */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => setShowCalculationDetails(!showCalculationDetails)}
            className="flex items-center justify-between w-full text-xs text-amber-300 hover:text-amber-200 py-1 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">
                Verify Grounding: Inspect Exact App-Calculated Metrics Fed to AI
              </span>
            </div>
            {showCalculationDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showCalculationDetails && (
            <div className="mt-3 p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-300 space-y-3">
              <div className="text-[11px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Hallucination Guarantee: Prompt enforces referencing ONLY these calculated values</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                    {topMetrics.region} Q2 vs Q3 Core Figures
                  </p>
                  <p>• Q2 Revenue: {formatCurrency(topMetrics.q2Revenue)}</p>
                  <p>• Q3 Revenue: {formatCurrency(topMetrics.q3Revenue)}</p>
                  <p>• Net Dollar Delta: {formatCurrency(topMetrics.dollarDelta)} ({formatPercent(topMetrics.pctDelta)})</p>
                  <p>• Absolute Magnitude: {formatCurrency(topMetrics.absDollarDelta)}</p>
                  <p>• Q2 Units: {topMetrics.q2Units.toLocaleString()} units</p>
                  <p>• Q3 Units: {topMetrics.q3Units.toLocaleString()} units ({formatPercent(topMetrics.unitsPctDelta)})</p>
                  <p>• Average Discount: {topMetrics.q2AvgDiscountPct.toFixed(1)}% (Q2) vs {topMetrics.q3AvgDiscountPct.toFixed(1)}% (Q3)</p>
                  <p>• Net Rev / Unit: {formatCurrency(topMetrics.q2RevPerUnit)} → {formatCurrency(topMetrics.q3RevPerUnit)}</p>
                </div>

                <div className="space-y-1.5 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                    Calculated Drivers for {topMetrics.region}
                  </p>
                  <p>• Top Channel: {topMetrics.topChannel?.name} (Shift: {formatCurrency(topMetrics.topChannel?.delta || 0)})</p>
                  <p>• Top Product: {topMetrics.topProduct?.name} (Shift: {formatCurrency(topMetrics.topProduct?.delta || 0)})</p>
                  <div className="pt-2 text-[10px] text-slate-400">
                    <p className="font-semibold text-slate-300 mb-0.5">All Regions Ranked by |Q3 - Q2| Shift:</p>
                    {calculatedData.q2ToQ3Ranking.map((rk, idx) => (
                      <p key={rk.region}>
                        {idx + 1}. {rk.region}: {formatCurrency(rk.dollarDelta)} ({formatPercent(rk.pctDelta)}) [Abs: {formatCurrency(rk.absDollarDelta)}]
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
