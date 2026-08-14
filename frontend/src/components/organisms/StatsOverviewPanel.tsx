import React from 'react';
import type { PlayerStatsSummary } from '../../types/stats';
import StatBadge from '../atoms/StatBadge';
import LoadingSpinner from '../atoms/LoadingSpinner';

interface StatsOverviewPanelProps {
  summary: PlayerStatsSummary | null;
  loading: boolean;
  error: string | null;
}

/**
 * A grid of six StatBadge KPI cards covering the key lifetime totals
 * from PlayerStatsSummary. Shows a spinner while loading and an inline
 * error banner on failure.
 */
const StatsOverviewPanel: React.FC<StatsOverviewPanelProps> = ({ summary, loading, error }) => {
  if (loading) {
    return <LoadingSpinner label="Loading Stats..." />;
  }

  if (error) {
    return (
      <div className="border-l-4 border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const kdDisplay = summary.totalDeaths === 0 ? 'Perfect' : summary.kdRatio.toFixed(2);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatBadge label="Matches" value={summary.matchesPlayed} />
      <StatBadge label="Wins" value={summary.matchesWon} color="bg-green-900/30" />
      <StatBadge label="Losses" value={summary.matchesLost} color="bg-red-900/30" />
      <StatBadge label="Win Rate" value={`${(summary.winRate * 100).toFixed(1)}%`} />
      <StatBadge label="K/D" value={kdDisplay} />
      <StatBadge label="Cases" value={summary.casesOpened} />
    </div>
  );
};

export default StatsOverviewPanel;
