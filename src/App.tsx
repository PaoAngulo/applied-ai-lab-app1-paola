/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CsvUploader } from './components/CsvUploader';
import { AiSummaryCard } from './components/AiSummaryCard';
import { RevenueChart } from './components/RevenueChart';
import { RevenueTable } from './components/RevenueTable';
import { CalculatedDriversBridge } from './components/CalculatedDriversBridge';
import { RawDataDrawer } from './components/RawDataDrawer';
import { SalesOrder, CalculatedSalesData } from './types/sales';
import { generateSampleCsvContent, parseSalesCsv } from './utils/csvParser';
import { calculateSalesMetrics, formatCurrency, formatPercent } from './utils/salesCalculator';
import {
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [fileName, setFileName] = useState<string>('sample_sales_orders.csv');
  const [calculatedData, setCalculatedData] = useState<CalculatedSalesData | null>(null);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAi, setIsAi] = useState<boolean>(true);
  const [aiSource, setAiSource] = useState<string>('gemini-3.8-flash');

  // Raw data modal state
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);

  // Trigger AI summary generation via server endpoint
  const requestAiSummary = useCallback(async (data: CalculatedSalesData) => {
    setIsAiLoading(true);
    setAiError(null);

    const payload = {
      metrics: {
        topRegion: data.topChangedRegion,
        topRegionMetrics: data.topRegionMetrics,
        allRegionsComparison: data.q2ToQ3Ranking,
      },
    };

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const result = await res.json();
      setAiSummary(result.summary);
      setIsAi(result.isAi ?? true);
      setAiSource(result.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.warn('AI summary request failed, generating grounded fallback:', err);
      // Generate grounded fallback summary so UI is always functioning
      const tm = data.topRegionMetrics;
      const s1 = `${tm.region} experienced the largest shift from Q2 to Q3, moving from ${formatCurrency(tm.q2Revenue)} to ${formatCurrency(tm.q3Revenue)}, a net change of ${formatCurrency(tm.dollarDelta)} (${formatPercent(tm.pctDelta)}).`;
      const s2 = `This movement was primarily driven by unit volumes shifting from ${tm.q2Units.toLocaleString()} to ${tm.q3Units.toLocaleString()} units (${formatPercent(tm.unitsPctDelta)}), with the ${tm.topChannel?.name || 'primary'} channel leading quarterly variance at ${formatCurrency(tm.topChannel?.delta || 0)}.`;
      const s3 = `Product shifts were led by ${tm.topProduct?.name || 'core offerings'} (${formatCurrency(tm.topProduct?.delta || 0)} difference), while average discount rates adjusted from ${tm.q2AvgDiscountPct.toFixed(1)}% to ${tm.q3AvgDiscountPct.toFixed(1)}%.`;

      setAiSummary(`${s1} ${s2} ${s3}`);
      setIsAi(false);
      setAiSource('calculated_fallback');
      setAiError(err?.message || null);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  // Update sales orders & recalculate
  const handleDataLoaded = useCallback((newOrders: SalesOrder[], name: string) => {
    setOrders(newOrders);
    setFileName(name);
    const metrics = calculateSalesMetrics(newOrders);
    setCalculatedData(metrics);

    if (metrics) {
      requestAiSummary(metrics);
    }
  }, [requestAiSummary]);

  // Load sample dataset
  const handleLoadSample = useCallback(() => {
    const csvContent = generateSampleCsvContent();
    const result = parseSalesCsv(csvContent);
    if (result.orders.length > 0) {
      handleDataLoaded(result.orders, 'sample_sales_orders.csv');
    }
  }, [handleDataLoaded]);

  // Load sample data on initial mount for instant working preview
  useEffect(() => {
    handleLoadSample();
  }, [handleLoadSample]);

  const handleReset = () => {
    setOrders([]);
    setCalculatedData(null);
    setAiSummary(null);
  };

  const totalRevenue = calculatedData?.grandTotal || 0;
  const q2Total = calculatedData?.totalByQuarter.Q2 || 0;
  const q3Total = calculatedData?.totalByQuarter.Q3 || 0;
  const q2Q3TotalDelta = q3Total - q2Total;
  const q2Q3TotalPct = q2Total > 0 ? (q2Q3TotalDelta / q2Total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasData={orders.length > 0}
        totalOrders={orders.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {orders.length === 0 ? (
          /* Empty / Upload View */
          <CsvUploader
            onDataLoaded={handleDataLoaded}
            onLoadSample={handleLoadSample}
          />
        ) : (
          /* Dashboard View */
          <div className="space-y-6">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Grand Total Revenue */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Total Revenue
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                  {formatCurrency(totalRevenue)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Across all {calculatedData?.regions.length || 0} regions & 4 quarters
                </span>
              </div>

              {/* Q2 Total */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-sky-600 tracking-wider block mb-1">
                  Q2 Revenue
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-sky-950 font-mono">
                  {formatCurrency(q2Total)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Base comparison quarter
                </span>
              </div>

              {/* Q3 Total */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider block mb-1">
                  Q3 Revenue
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono">
                  {formatCurrency(q3Total)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Post-shift quarter
                </span>
              </div>

              {/* Q2 to Q3 Global Shift */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Total Q2 → Q3 Shift
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-xl sm:text-2xl font-extrabold font-mono ${
                      q2Q3TotalDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {q2Q3TotalDelta >= 0 ? '+' : ''}
                    {formatCurrency(q2Q3TotalDelta)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {formatPercent(q2Q3TotalPct)} net change
                </span>
              </div>

              {/* Top Shift Region Badge */}
              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-amber-50 p-4 rounded-xl border border-indigo-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-800 tracking-wider">
                    Most Changed Region
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-950">
                  {calculatedData?.topChangedRegion || 'N/A'}
                </span>
                <span className="text-[11px] font-semibold text-indigo-700 block mt-1">
                  {calculatedData?.topRegionMetrics.dollarDelta !== undefined && (
                    <>
                      {calculatedData.topRegionMetrics.dollarDelta >= 0 ? '+' : ''}
                      {formatCurrency(calculatedData.topRegionMetrics.dollarDelta)} (
                      {formatPercent(calculatedData.topRegionMetrics.pctDelta)})
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Quick Upload Banner for Swapping File */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">{fileName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-500">
                    {orders.length.toLocaleString()} sales orders parsed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRawDataOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Inspect Raw CSV Rows
                </button>

                <label className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Another CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const text = ev.target?.result as string;
                          const res = parseSalesCsv(text);
                          if (res.orders.length > 0) {
                            handleDataLoaded(res.orders, file.name);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Section 1: Executive AI 3-Sentence Summary Card */}
            {calculatedData && (
              <AiSummaryCard
                summary={aiSummary}
                isLoading={isAiLoading}
                onRegenerate={() => requestAiSummary(calculatedData)}
                calculatedData={calculatedData}
                error={aiError}
                isAi={isAi}
                source={aiSource}
              />
            )}

            {/* Section 2: Chart - Total Revenue by Region and Quarter */}
            {calculatedData && <RevenueChart calculatedData={calculatedData} />}

            {/* Section 3: Table - Total Revenue by Region and Quarter */}
            {calculatedData && <RevenueTable calculatedData={calculatedData} />}

            {/* Section 4: Quantitative Bridge - Why the Top Region Changed */}
            {calculatedData && (
              <CalculatedDriversBridge calculatedData={calculatedData} />
            )}
          </div>
        )}
      </main>

      {/* Raw Data Modal */}
      <RawDataDrawer
        isOpen={isRawDataOpen}
        onClose={() => setIsRawDataOpen(false)}
        orders={orders}
        fileName={fileName}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            SalesPulse Regional Revenue Analytics • Grounded Gemini 3.8 Flash Synthesis
          </p>
          <p className="text-slate-400">
            Strictly grounded in app-calculated orders data: quarter, region, channel, product, units, discount_pct, revenue
          </p>
        </div>
      </footer>
    </div>
  );
}
