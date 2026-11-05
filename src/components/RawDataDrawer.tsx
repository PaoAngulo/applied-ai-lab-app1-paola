import React, { useState } from 'react';
import { SalesOrder } from '../types/sales';
import { formatCurrency } from '../utils/salesCalculator';
import { FileSpreadsheet, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RawDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SalesOrder[];
  fileName: string;
}

export const RawDataDrawer: React.FC<RawDataDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  fileName,
}) => {
  const [search, setSearch] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  if (!isOpen) return null;

  const quarters = Array.from(new Set(orders.map((o) => o.quarter))).sort();
  const regions = Array.from(new Set(orders.map((o) => o.region))).sort();

  const filteredOrders = orders.filter((o) => {
    if (quarterFilter !== 'ALL' && o.quarter !== quarterFilter) return false;
    if (regionFilter !== 'ALL' && o.region !== regionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.product.toLowerCase().includes(q) ||
        o.channel.toLowerCase().includes(q) ||
        o.region.toLowerCase().includes(q) ||
        o.quarter.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Uploaded Orders Dataset
              </h3>
              <p className="text-xs text-slate-500">
                {fileName} • {orders.length.toLocaleString()} total rows parsed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by product, channel, region..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={quarterFilter}
              onChange={(e) => {
                setQuarterFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Quarters</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Quarter</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Discount %</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400 font-mono">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {row.quarter}
                  </td>
                  <td className="py-2 px-3 text-slate-700">{row.region}</td>
                  <td className="py-2 px-3 text-slate-600">{row.channel}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">
                    {row.product}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    {row.units.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {row.discount_pct.toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
