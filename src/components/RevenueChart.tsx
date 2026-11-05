import React, { useState } from 'react';
import { CalculatedSalesData, QuarterName } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/salesCalculator';
import { BarChart3, Layers, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  calculatedData: CalculatedSalesData;
}

type ViewMode = 'by_region' | 'by_quarter' | 'stacked';

const QUARTER_COLORS: Record<QuarterName, { bg: string; fill: string; border: string; label: string }> = {
  Q1: { bg: 'bg-indigo-500', fill: '#6366f1', border: '#4f46e5', label: 'Quarter 1' },
  Q2: { bg: 'bg-sky-500', fill: '#0ea5e9', border: '#0284c7', label: 'Quarter 2' },
  Q3: { bg: 'bg-emerald-500', fill: '#10b981', border: '#059669', label: 'Quarter 3' },
  Q4: { bg: 'bg-purple-500', fill: '#a855f7', border: '#9333ea', label: 'Quarter 4' },
};

const REGION_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const RevenueChart: React.FC<RevenueChartProps> = ({ calculatedData }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('by_region');
  const [hoveredBar, setHoveredBar] = useState<{
    title: string;
    subTitle: string;
    value: number;
    delta?: { text: string; positive: boolean };
    x: number;
    y: number;
  } | null>(null);

  const { tableData, regions, quarters, topChangedRegion } = calculatedData;

  // Maximum revenue calculation for Y axis scale
  let maxBarValue = 0;
  if (viewMode === 'by_region' || viewMode === 'by_quarter') {
    tableData.forEach((r) => {
      maxBarValue = Math.max(maxBarValue, r.q1, r.q2, r.q3, r.q4);
    });
  } else {
    // stacked
    tableData.forEach((r) => {
      maxBarValue = Math.max(maxBarValue, r.total);
    });
  }

  // Round up max to clean round numbers for Y-axis ticks
  const niceMax = Math.ceil((maxBarValue * 1.15) / 10000) * 10000 || 50000;
  const yTicks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 60;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / niceMax) * chartHeight;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Total Revenue by Region & Quarter
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Q2 vs Q3 Focus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare quarterly revenue across geographic markets
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setViewMode('by_region')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'by_region'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group by Region
          </button>
          <button
            onClick={() => setViewMode('by_quarter')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'by_quarter'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group by Quarter
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'stacked'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stacked Total
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-2 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {viewMode !== 'by_quarter' ? (
            quarters.map((q) => (
              <div key={q} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm shadow-2xs"
                  style={{ backgroundColor: QUARTER_COLORS[q].fill }}
                />
                <span className="font-medium text-slate-700">{q}</span>
              </div>
            ))
          ) : (
            regions.map((reg, idx) => (
              <div key={reg} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm shadow-2xs"
                  style={{ backgroundColor: REGION_PALETTE[idx % REGION_PALETTE.length] }}
                />
                <span className="font-medium text-slate-700">{reg}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          <TrendingUp className="w-3 h-3" />
          <span>
            Top Shift Region: <strong>{topChangedRegion}</strong>
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-x-auto pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Y Axis Grid lines & labels */}
          {yTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={i === 0 ? '' : '3 3'}
                  strokeWidth={i === 0 ? 1.5 : 1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                  fontFamily="sans-serif"
                >
                  {formatCurrency(tickVal)}
                </text>
              </g>
            );
          })}

          {/* VIEW MODE 1: GROUPED BY REGION */}
          {viewMode === 'by_region' && (
            <>
              {tableData.map((row, rIdx) => {
                const groupWidth = chartWidth / tableData.length;
                const groupX = paddingLeft + rIdx * groupWidth;
                const barMargin = 6;
                const availableWidth = groupWidth - barMargin * 2;
                const barWidth = Math.min(32, availableWidth / 4 - 3);
                const totalBarsWidth = barWidth * 4 + 3 * 3;
                const startX = groupX + (groupWidth - totalBarsWidth) / 2;

                const qValues: { q: QuarterName; val: number }[] = [
                  { q: 'Q1', val: row.q1 },
                  { q: 'Q2', val: row.q2 },
                  { q: 'Q3', val: row.q3 },
                  { q: 'Q4', val: row.q4 },
                ];

                const isTop = row.region === topChangedRegion;

                return (
                  <g key={row.region}>
                    {/* Region background highlight for top changed region */}
                    {isTop && (
                      <rect
                        x={groupX + 4}
                        y={paddingTop}
                        width={groupWidth - 8}
                        height={chartHeight}
                        fill="#fef3c7"
                        fillOpacity="0.35"
                        rx="8"
                      />
                    )}

                    {qValues.map(({ q, val }, qIdx) => {
                      const barX = startX + qIdx * (barWidth + 3);
                      const barY = getY(val);
                      const barH = paddingTop + chartHeight - barY;

                      return (
                        <g key={q}>
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={Math.max(2, barH)}
                            fill={QUARTER_COLORS[q].fill}
                            rx="3"
                            className="transition-all duration-200 hover:opacity-85 cursor-pointer"
                            onMouseEnter={() => {
                              const deltaText =
                                q === 'Q3'
                                  ? `${formatCurrency(row.q2ToQ3DollarDelta)} (${formatPercent(row.q2ToQ3PctDelta)} vs Q2)`
                                  : undefined;
                              setHoveredBar({
                                title: `${row.region} - ${q}`,
                                subTitle: `Quarterly Revenue`,
                                value: val,
                                delta: deltaText
                                  ? {
                                      text: deltaText,
                                      positive: row.q2ToQ3DollarDelta >= 0,
                                    }
                                  : undefined,
                                x: barX + barWidth / 2,
                                y: barY,
                              });
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        </g>
                      );
                    })}

                    {/* Region X-axis Label */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={paddingTop + chartHeight + 20}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight={isTop ? '700' : '600'}
                      fill={isTop ? '#b45309' : '#1e293b'}
                    >
                      {row.region} {isTop ? '★' : ''}
                    </text>

                    {/* Q2 to Q3 delta indicator under label */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={paddingTop + chartHeight + 36}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={row.q2ToQ3DollarDelta >= 0 ? '#059669' : '#dc2626'}
                    >
                      Q2→Q3: {row.q2ToQ3DollarDelta >= 0 ? '+' : ''}
                      {formatCurrency(row.q2ToQ3DollarDelta)}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* VIEW MODE 2: GROUPED BY QUARTER */}
          {viewMode === 'by_quarter' && (
            <>
              {quarters.map((q, qIdx) => {
                const groupWidth = chartWidth / quarters.length;
                const groupX = paddingLeft + qIdx * groupWidth;
                const barMargin = 6;
                const availableWidth = groupWidth - barMargin * 2;
                const barWidth = Math.min(28, availableWidth / regions.length - 3);
                const totalBarsWidth = barWidth * regions.length + (regions.length - 1) * 3;
                const startX = groupX + (groupWidth - totalBarsWidth) / 2;

                return (
                  <g key={q}>
                    {/* Quarter group divider */}
                    {qIdx > 0 && (
                      <line
                        x1={groupX}
                        y1={paddingTop}
                        x2={groupX}
                        y2={paddingTop + chartHeight}
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                      />
                    )}

                    {tableData.map((row, rIdx) => {
                      const val = q === 'Q1' ? row.q1 : q === 'Q2' ? row.q2 : q === 'Q3' ? row.q3 : row.q4;
                      const barX = startX + rIdx * (barWidth + 3);
                      const barY = getY(val);
                      const barH = paddingTop + chartHeight - barY;
                      const color = REGION_PALETTE[rIdx % REGION_PALETTE.length];

                      return (
                        <rect
                          key={row.region}
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={Math.max(2, barH)}
                          fill={color}
                          rx="3"
                          className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                          onMouseEnter={() => {
                            setHoveredBar({
                              title: `${q} - ${row.region}`,
                              subTitle: `Regional Revenue`,
                              value: val,
                              x: barX + barWidth / 2,
                              y: barY,
                            });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      );
                    })}

                    <text
                      x={groupX + groupWidth / 2}
                      y={paddingTop + chartHeight + 24}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {q}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* VIEW MODE 3: STACKED TOTAL BY REGION */}
          {viewMode === 'stacked' && (
            <>
              {tableData.map((row, rIdx) => {
                const groupWidth = chartWidth / tableData.length;
                const groupX = paddingLeft + rIdx * groupWidth;
                const barWidth = Math.min(50, groupWidth * 0.55);
                const barX = groupX + (groupWidth - barWidth) / 2;

                const qValues: { q: QuarterName; val: number }[] = [
                  { q: 'Q1', val: row.q1 },
                  { q: 'Q2', val: row.q2 },
                  { q: 'Q3', val: row.q3 },
                  { q: 'Q4', val: row.q4 },
                ];

                let accumulatedVal = 0;
                const isTop = row.region === topChangedRegion;

                return (
                  <g key={row.region}>
                    {qValues.map(({ q, val }) => {
                      const bottomVal = accumulatedVal;
                      accumulatedVal += val;
                      const topY = getY(accumulatedVal);
                      const bottomY = getY(bottomVal);
                      const barH = bottomY - topY;

                      return (
                        <rect
                          key={q}
                          x={barX}
                          y={topY}
                          width={barWidth}
                          height={Math.max(0, barH)}
                          fill={QUARTER_COLORS[q].fill}
                          className="transition-all duration-200 hover:opacity-85 cursor-pointer"
                          onMouseEnter={() => {
                            setHoveredBar({
                              title: `${row.region} (${q})`,
                              subTitle: `Contribution to ${formatCurrency(row.total)}`,
                              value: val,
                              x: barX + barWidth / 2,
                              y: topY,
                            });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      );
                    })}

                    {/* Total on top of stacked bar */}
                    <text
                      x={barX + barWidth / 2}
                      y={getY(row.total) - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#334155"
                    >
                      {formatCurrency(row.total)}
                    </text>

                    {/* Region Label */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={paddingTop + chartHeight + 22}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight={isTop ? '700' : '600'}
                      fill={isTop ? '#b45309' : '#1e293b'}
                    >
                      {row.region}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Interactive Floating Tooltip inside SVG */}
          {hoveredBar && (
            <g
              transform={`translate(${Math.min(
                svgWidth - 160,
                Math.max(paddingLeft, hoveredBar.x - 75)
              )}, ${Math.max(10, hoveredBar.y - 75)})`}
              className="pointer-events-none"
            >
              <rect
                width="150"
                height={hoveredBar.delta ? 68 : 52}
                rx="8"
                fill="#0f172a"
                fillOpacity="0.95"
                filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))"
              />
              <text x="12" y="18" fill="#94a3b8" fontSize="10" fontWeight="600">
                {hoveredBar.title}
              </text>
              <text x="12" y="36" fill="#ffffff" fontSize="13" fontWeight="700">
                {formatCurrency(hoveredBar.value)}
              </text>
              {hoveredBar.delta && (
                <text
                  x="12"
                  y="54"
                  fill={hoveredBar.delta.positive ? '#34d399' : '#f87171'}
                  fontSize="10"
                  fontWeight="600"
                >
                  {hoveredBar.delta.text}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
