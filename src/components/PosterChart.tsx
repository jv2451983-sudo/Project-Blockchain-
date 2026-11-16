import React, { useState } from 'react';
import { PosterChartSpec, PosterThemeTokens } from '../types/poster';

interface PosterChartProps {
  chart: PosterChartSpec;
  theme: PosterThemeTokens;
}

export const PosterChart: React.FC<PosterChartProps> = ({ chart, theme }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!chart.data || chart.data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-lg">
        No chart series rows defined yet. Add data points in the Section Editor.
      </div>
    );
  }

  const allValues = chart.data.flatMap((d) => [d.primaryValue, d.baselineValue]);
  const rawMax = Math.max(...allValues, 1);
  const niceMax = Math.ceil(rawMax * 1.15);

  const width = 460;
  const height = 220;
  const padLeft = 42;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (niceMax / tickCount) * i);

  const groupWidth = plotW / chart.data.length;
  const barWidth = Math.min(26, Math.max(12, groupWidth * 0.28));
  const barGap = 5;

  const activeDatum = hoveredIdx !== null ? chart.data[hoveredIdx] : null;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-stone-900 leading-snug">{chart.title}</h4>
        <p className="text-xs text-stone-500 mt-0.5">{chart.subtitle}</p>
      </div>

      {/* Legend & Hover Readout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600 border-b border-stone-100 pb-2">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs inline-block"
              style={{ backgroundColor: theme.chartPrimaryHex }}
              aria-hidden="true"
            />
            <span className="font-medium text-stone-800">{chart.primarySeriesLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs inline-block"
              style={{ backgroundColor: theme.chartBaselineHex }}
              aria-hidden="true"
            />
            <span>{chart.baselineSeriesLabel}</span>
          </span>
        </div>

        <span className="font-mono tabular-nums text-[11px] text-stone-700 min-h-[16px]">
          {activeDatum
            ? `${activeDatum.label}: ${activeDatum.primaryValue}${chart.unit} vs ${activeDatum.baselineValue}${chart.unit}`
            : `Unit: ${chart.unit}`}
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          role="img"
          aria-label={chart.title}
        >
          {/* Horizontal grid lines & Y-axis ticks */}
          {ticks.map((tickVal, idx) => {
            const y = padTop + plotH - (tickVal / niceMax) * plotH;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={idx === 0 ? '#D6D3D1' : '#F1EFEA'}
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-stone-500 text-[10px]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {Math.round(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {chart.data.map((datum, idx) => {
            const centerX = padLeft + idx * groupWidth + groupWidth / 2;
            const primaryH = Math.max(2, (datum.primaryValue / niceMax) * plotH);
            const baselineH = Math.max(2, (datum.baselineValue / niceMax) * plotH);

            const primaryX = centerX - barWidth - barGap / 2;
            const baselineX = centerX + barGap / 2;
            const primaryY = padTop + plotH - primaryH;
            const baselineY = padTop + plotH - baselineH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={datum.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Invisible hit region for reliable hover */}
                <rect
                  x={padLeft + idx * groupWidth}
                  y={padTop}
                  width={groupWidth}
                  height={plotH + padBottom}
                  fill={isHovered ? 'rgba(28, 25, 23, 0.03)' : 'transparent'}
                />

                {/* Primary Bar */}
                <rect
                  x={primaryX}
                  y={primaryY}
                  width={barWidth}
                  height={primaryH}
                  rx={2}
                  fill={theme.chartPrimaryHex}
                  opacity={hoveredIdx === null || isHovered ? 1 : 0.65}
                />
                <text
                  x={primaryX + barWidth / 2}
                  y={primaryY - 4}
                  textAnchor="middle"
                  className="fill-stone-900 text-[9.5px] font-medium"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {datum.primaryValue}
                </text>

                {/* Baseline Bar */}
                <rect
                  x={baselineX}
                  y={baselineY}
                  width={barWidth}
                  height={baselineH}
                  rx={2}
                  fill={theme.chartBaselineHex}
                  opacity={hoveredIdx === null || isHovered ? 0.9 : 0.55}
                />
                <text
                  x={baselineX + barWidth / 2}
                  y={baselineY - 4}
                  textAnchor="middle"
                  className="fill-stone-500 text-[9.5px]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {datum.baselineValue}
                </text>

                {/* X-axis label */}
                <text
                  x={centerX}
                  y={padTop + plotH + 18}
                  textAnchor="middle"
                  className="fill-stone-700 text-[10px] font-medium"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {datum.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
