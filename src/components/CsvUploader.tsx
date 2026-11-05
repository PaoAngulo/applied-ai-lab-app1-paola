import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { parseSalesCsv } from '../utils/csvParser';
import { SalesOrder } from '../types/sales';

interface CsvUploaderProps {
  onDataLoaded: (orders: SalesOrder[], fileName: string) => void;
  onLoadSample: () => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onDataLoaded,
  onLoadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_COLUMNS = [
    { key: 'quarter', label: 'quarter', desc: 'e.g. Q1, Q2, Q3, Q4' },
    { key: 'region', label: 'region', desc: 'e.g. North, South, East, West' },
    { key: 'channel', label: 'channel', desc: 'e.g. Direct, Online, Retail' },
    { key: 'product', label: 'product', desc: 'e.g. Cloud Pro, Hardware Hub' },
    { key: 'units', label: 'units', desc: 'Number of units sold' },
    { key: 'discount_pct', label: 'discount_pct', desc: 'Discount percentage (0-100)' },
    { key: 'revenue', label: 'revenue', desc: 'Order total revenue in $' },
  ];

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMsg('Please upload a valid .csv file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseSalesCsv(text);

        if (result.errors.length > 0 && result.orders.length === 0) {
          setErrorMsg(result.errors.join(' | '));
          setIsProcessing(false);
          return;
        }

        if (result.orders.length === 0) {
          setErrorMsg('No valid sales order rows could be extracted from this CSV.');
          setIsProcessing(false);
          return;
        }

        onDataLoaded(result.orders, file.name);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to parse CSV file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read the file.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 mb-3 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-[#CE1126]" />
          <Sparkles className="w-3.5 h-3.5 text-[#003893]" />
          Quarterly Regional Sales Analytics
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Sales Orders CSV
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Analyze total revenue by region and quarter, explore interactive charts and tables,
          and receive an AI three-sentence variance summary grounded solely in app-calculated figures.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all bg-white shadow-sm ${
          isDragging
            ? 'border-[#003893] bg-blue-50/40 scale-[1.01]'
            : 'border-slate-300 hover:border-[#003893] hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#003893] flex items-center justify-center shadow-inner">
          <UploadCloud className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Drag and drop your sales orders CSV here
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Supports comma-separated values (.csv) with headers
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#003893] text-white hover:bg-[#002d77] shadow-sm shadow-blue-900/20 transition-all cursor-pointer"
          >
            {isProcessing ? 'Processing File...' : 'Browse Computer'}
          </button>

          <span className="text-xs text-slate-400">or</span>

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#001D4A] text-white hover:bg-slate-800 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#FCD116]" />
            <span>Load Sample Sales Data</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#CE1126] text-xs flex items-center justify-center gap-2 max-w-lg mx-auto text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#CE1126]" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Expected Schema Specification Card */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-[#003893]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Expected CSV Format & Columns
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Your CSV file must include the following 7 columns (headers are case-insensitive and trimmed):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {REQUIRED_COLUMNS.map((col) => (
            <div
              key={col.key}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {col.label}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {col.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
