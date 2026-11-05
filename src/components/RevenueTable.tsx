import React, { useState } from 'react';
import { CalculatedSalesData, RegionQuarterRow } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/salesCalculator';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface RevenueTableProps {
  calculatedData: CalculatedSalesData;
}

type SortField = 'region' | 'q1' | 'q2' | 'q3' | 'q4' | 'total' | 'q2ToQ3DollarDelta';
type SortDirection = 'asc' | 'desc';

export const RevenueTable: React.FC<RevenueTableProps> = ({ calculatedData }) => {
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRegion, setExpandedRegion] = useState<string | null>(
    calculatedData.topChangedRegion || null
  );

  const { tableData, totalByQuarter, grandTotal, topChangedRegion, allRegionsMetrics } = calculatedData;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...tableData].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'region') {
      comparison = a.region.localeCompare(b.region);
    } else {
      comparison = (a[sortField] as number) - (b[sortField] as number);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Calculate overall Q2 to Q3 delta across all regions
  const totalQ2 = totalByQuarter.Q2;
  const totalQ3 = totalByQuarter.Q3;
  const totalQ2Q3Delta = totalQ3 - totalQ2;
  const totalQ2Q3Pct = totalQ2 > 0 ? (totalQ2Q3Delta / totalQ2) * 100 : 0;

  const exportTableCsv = () => {
    const headers = ['Region', 'Q1 Revenue', 'Q2 Revenue', 'Q3 Revenue', 'Q4 Revenue', 'Total Revenue', 'Q2 to Q3 Shift ($)', 'Q2 to Q3 Shift (%)'];
    const rows = sortedData.map((r) => [
      r.region,
      r.q1,
      r.q2,
      r.q3,
      r.q4,
      r.total,
      r.q2ToQ3DollarDelta,
      r.q2ToQ3PctDelta.toFixed(2) + '%',
    ]);
    const summaryRow = ['Total', totalByQuarter.Q1, totalByQuarter.Q2, totalByQuarter.Q3, totalByQuarter.Q4, grandTotal, totalQ2Q3Delta, totalQ2Q3Pct.toFixed(2) + '%'];
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quarterly_revenue_by_region.csv';
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Quarterly Revenue by Region Table
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              ({tableData.length} Regions)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any row to reveal detailed channel & product variance drivers
          </p>
        </div>

        <button
          onClick={exportTableCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Summary Table</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th
                onClick={() => handleSort('region')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q1')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Q1</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q2')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none bg-sky-50/50"
              >
                <div className="flex items-center justify-end gap-1 text-sky-800">
                  <span>Q2</span>
                  <ArrowUpDown className="w-3 h-3 text-sky-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q3')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none bg-emerald-50/50"
              >
                <div className="flex items-center justify-end gap-1 text-emerald-800">
                  <span>Q3</span>
                  <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q4')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Q4</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('total')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none font-extrabold"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q2ToQ3DollarDelta')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none bg-indigo-50/50 text-indigo-900"
              >
                <div className="flex items-center justify-end gap-1 font-extrabold">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Q2 → Q3 Shift</span>
                  <ArrowUpDown className="w-3 h-3 text-indigo-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {sortedData.map((row) => {
              const isTop = row.region === topChangedRegion;
              const isExpanded = expandedRegion === row.region;
              const isPositive = row.q2ToQ3DollarDelta >= 0;
              const regionDetails = allRegionsMetrics[row.region];

              return (
                <React.Fragment key={row.region}>
                  <tr
                    onClick={() => setExpandedRegion(isExpanded ? null : row.region)}
                    className={`transition-colors cursor-pointer group ${
                      isTop
                        ? 'bg-amber-50/40 hover:bg-amber-50/70 font-semibold'
                        : isExpanded
                        ? 'bg-slate-50/80'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="font-semibold">{row.region}</span>
                        {isTop && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Largest Shift
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(row.q1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-sky-900 bg-sky-50/30">
                      {formatCurrency(row.q2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-900 bg-emerald-50/30">
                      {formatCurrency(row.q3)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(row.q4)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono bg-indigo-50/30">
                      <div className="inline-flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatCurrency(row.q2ToQ3DollarDelta)}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({formatPercent(row.q2ToQ3PctDelta)})
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Drill-down Sub-Row for Region */}
                  {isExpanded && regionDetails && (
                    <tr className="bg-slate-50/90 border-y border-slate-200/80">
                      <td colSpan={7} className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Volume & Discount Metric card */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
                              {row.region} Volume & Pricing (Q2 vs Q3)
                            </span>
                            <div className="space-y-1.5 text-xs text-slate-700">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Units Sold:</span>
                                <span className="font-semibold">
                                  {regionDetails.q2Units} (Q2) → {regionDetails.q3Units} (Q3)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Unit Delta:</span>
                                <span
                                  className={`font-semibold ${
                                    regionDetails.unitsDelta >= 0
                                      ? 'text-emerald-600'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {regionDetails.unitsDelta >= 0 ? '+' : ''}
                                  {regionDetails.unitsDelta.toLocaleString()} ({formatPercent(regionDetails.unitsPctDelta)})
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-slate-100">
                                <span className="text-slate-500">Avg Discount:</span>
                                <span className="font-semibold">
                                  {regionDetails.q2AvgDiscountPct.toFixed(1)}% → {regionDetails.q3AvgDiscountPct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Net Rev / Unit:</span>
                                <span className="font-semibold">
                                  {formatCurrency(regionDetails.q2RevPerUnit)} → {formatCurrency(regionDetails.q3RevPerUnit)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Channel Variance */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
                              Channel Shift (Q2 → Q3)
                            </span>
                            <div className="space-y-1.5 text-xs">
                              {regionDetails.channels.slice(0, 4).map((ch) => (
                                <div key={ch.name} className="flex items-center justify-between">
                                  <span className="text-slate-700 truncate max-w-[110px]" title={ch.name}>
                                    {ch.name}
                                  </span>
                                  <span
                                    className={`font-mono font-medium ${
                                      ch.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {ch.delta >= 0 ? '+' : ''}
                                    {formatCurrency(ch.delta)}
                                  </span>
                                </div>
                              ))}
                              {regionDetails.channels.length === 0 && (
                                <p className="text-slate-400 text-xs">No channel breakdown</p>
                              )}
                            </div>
                          </div>

                          {/* Product Variance */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
                              Product Shift (Q2 → Q3)
                            </span>
                            <div className="space-y-1.5 text-xs">
                              {regionDetails.products.slice(0, 4).map((p) => (
                                <div key={p.name} className="flex items-center justify-between">
                                  <span className="text-slate-700 truncate max-w-[120px]" title={p.name}>
                                    {p.name}
                                  </span>
                                  <span
                                    className={`font-mono font-medium ${
                                      p.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {p.delta >= 0 ? '+' : ''}
                                    {formatCurrency(p.delta)}
                                  </span>
                                </div>
                              ))}
                              {regionDetails.products.length === 0 && (
                                <p className="text-slate-400 text-xs">No product breakdown</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          {/* Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
              <td className="py-3.5 px-4 font-extrabold uppercase tracking-wide">
                Total (All Regions)
              </td>
              <td className="py-3.5 px-3 text-right font-mono">
                {formatCurrency(totalByQuarter.Q1)}
              </td>
              <td className="py-3.5 px-3 text-right font-mono bg-sky-100/50 text-sky-950">
                {formatCurrency(totalByQuarter.Q2)}
              </td>
              <td className="py-3.5 px-3 text-right font-mono bg-emerald-100/50 text-emerald-950">
                {formatCurrency(totalByQuarter.Q3)}
              </td>
              <td className="py-3.5 px-3 text-right font-mono">
                {formatCurrency(totalByQuarter.Q4)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                {formatCurrency(grandTotal)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono bg-indigo-100/40">
                <span
                  className={
                    totalQ2Q3Delta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }
                >
                  {totalQ2Q3Delta >= 0 ? '+' : ''}
                  {formatCurrency(totalQ2Q3Delta)} ({formatPercent(totalQ2Q3Pct)})
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
