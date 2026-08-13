import React, { useMemo } from 'react';
import { PieBreakdownChart } from './PieBreakdownChart';
import type { PlayerStatsSummary } from '../../types/stats';

interface WinLossPieChartProps {
  summary: PlayerStatsSummary;
  height?: number;
}

interface PieSlice {
  name: string;
  value: number;
  fill: string;
}

/**
 * Donut chart showing Win / Loss / Draw breakdown derived from
 * PlayerStatsSummary. Zero-value slices are excluded so the chart
 * is not cluttered when a player has no draws.
 *
 * Colour semantics: Win = green, Loss = red, Draw = slate.
 */
export const WinLossPieChart: React.FC<WinLossPieChartProps> = ({ summary, height = 280 }) => {
  const slices = useMemo<PieSlice[]>(() => {
    const candidates: PieSlice[] = [
      { name: 'Wins', value: summary.matchesWon, fill: '#10b981' },
      { name: 'Losses', value: summary.matchesLost, fill: '#ef4444' },
      { name: 'Draws', value: summary.matchesDrawn, fill: '#64748b' },
    ];
    return candidates.filter((slice) => slice.value > 0);
  }, [summary.matchesWon, summary.matchesLost, summary.matchesDrawn]);

  return (
    <PieBreakdownChart data={slices} dataKey="value" nameKey="name" height={height} showLegend />
  );
};
