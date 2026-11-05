import React from 'react';
import { BarChart3, Download, FileSpreadsheet, RefreshCw, Sparkles } from 'lucide-react';
import { generateSampleCsvContent } from '../utils/csvParser';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
  totalOrders: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasData,
  totalOrders,
}) => {
  const handleDownloadSample = () => {
    const csvContent = generateSampleCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sales_orders_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">SalesPulse</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                AI Regional Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quarterly Revenue by Region & Grounded Q2–Q3 Variance Analysis
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={handleDownloadSample}
            title="Download CSV format template"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Sample CSV</span>
          </button>

          {!hasData ? (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 active:scale-98 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <strong className="text-slate-900 font-semibold">{totalOrders.toLocaleString()}</strong> orders loaded
              </span>
              <button
                onClick={onReset}
                title="Upload another CSV"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload New</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
