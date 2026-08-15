import React from 'react';
import type { PlayerStatsSummary } from '../../types/stats';
import { ChartSectionTitle } from '../atoms/ChartSectionTitle';
import { ChartSkeletonPanel } from '../atoms/ChartSkeletonPanel';
import { ComingSoonPanel } from '../atoms/ComingSoonPanel';
import { WinLossPieChart } from '../molecules/WinLossPieChart';

const PIE_HEIGHT = 280;
const STUB_HEIGHT = 200;

interface CombatSectionProps {
  summary: PlayerStatsSummary | null;
  loading: boolean;
  error: string | null;
}

/**
 * Combat & Performance section organism.
 *
 * Backed charts (1 endpoint-supported):
 *   - Win / Loss / Draw Donut (from /summary)
 *
 * Coming-soon stubs (3 advanced charts requiring per-match time-series):
 *   - K/D & Damage per Match (ComposedChart)
 *   - Damage Dealt vs. Taken Differential (Split AreaChart)
 *   - Crit Rate Progression vs. Win Rate (ComposedChart)
 */
const CombatSection: React.FC<CombatSectionProps> = ({ summary, loading, error }) => (
  <section aria-labelledby="combat-section-heading">
    <ChartSectionTitle
      title="Match History & Combat"
      subtitle="Win split and performance breakdown"
    />

    {error && (
      <div className="mb-4 border-l-4 border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )}

    {/* Win / Loss / Draw donut */}
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-600">
        Win / Loss / Draw
      </p>
      {loading ? (
        <ChartSkeletonPanel height={PIE_HEIGHT} />
      ) : summary && summary.matchesPlayed > 0 ? (
        <WinLossPieChart summary={summary} height={PIE_HEIGHT} />
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 py-12 text-sm text-gray-600">
          No match data yet.
        </div>
      )}
    </div>

    {/* Advanced chart stubs */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ComingSoonPanel
        chartName="K/D & Damage per Match"
        description="Dual-axis bars + lines - requires per-match time-series endpoint."
        height={STUB_HEIGHT}
      />
      <ComingSoonPanel
        chartName="Damage Dealt vs. Taken"
        description="Overlapping area paths - requires per-match time-series endpoint."
        height={STUB_HEIGHT}
      />
      <ComingSoonPanel
        chartName="Crit Rate vs. Win Rate"
        description="Bar + line overlay - requires per-match time-series endpoint."
        height={STUB_HEIGHT}
      />
    </div>
  </section>
);

export default CombatSection;
