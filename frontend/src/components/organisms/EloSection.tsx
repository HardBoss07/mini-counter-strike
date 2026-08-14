import React, { type SetStateAction, type Dispatch } from 'react';
import type { EloHistoryPoint } from '../../types/stats';
import type { EloHistoryQueryFilters } from '../../types/stats';
import { ChartSectionTitle } from '../atoms/ChartSectionTitle';
import { ChartSkeletonPanel } from '../atoms/ChartSkeletonPanel';
import { ComingSoonPanel } from '../atoms/ComingSoonPanel';
import { EloTrendChart } from '../molecules/EloTrendChart';

const CHART_HEIGHT = 300;

interface FilterOption {
  label: string;
  value: EloHistoryQueryFilters;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'Last 10', value: { limit: 10 } },
  { label: 'Last 30', value: { limit: 30 } },
  { label: 'All Time', value: {} },
];

interface EloSectionProps {
  data: EloHistoryPoint[];
  loading: boolean;
  error: string | null;
  filters: EloHistoryQueryFilters;
  onFiltersChange: Dispatch<SetStateAction<EloHistoryQueryFilters>>;
}

/**
 * Section organism composing:
 *   - Time-range filter pill row (Last 10 / Last 30 / All Time)
 *   - EloTrendChart molecule (backed by /elo-history endpoint)
 *   - Two ComingSoonPanel stubs for unimplemented advanced charts
 */
const EloSection: React.FC<EloSectionProps> = ({
  data,
  loading,
  error,
  filters,
  onFiltersChange,
}) => {
  const activeLabel =
    FILTER_OPTIONS.find((option) => JSON.stringify(option.value) === JSON.stringify(filters))
      ?.label ?? 'All Time';

  return (
    <section aria-labelledby="elo-section-heading">
      <ChartSectionTitle
        title="Elo Progression"
        subtitle="Rating trajectory over your match history"
      />

      {/* Time-range filter pills */}
      <div className="mb-4 flex gap-2" role="group" aria-label="Elo history range">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.label === activeLabel;
          return (
            <button
              key={option.label}
              onClick={() => onFiltersChange(option.value)}
              className={`rounded px-3 py-1 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                isActive
                  ? 'bg-tactical-accent text-white'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 border-l-4 border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <ChartSkeletonPanel height={CHART_HEIGHT} />
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 py-16 text-sm text-gray-600">
          No match history yet. Play a match to start tracking your Elo.
        </div>
      ) : (
        <EloTrendChart data={data} height={CHART_HEIGHT} />
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ComingSoonPanel
          chartName="Elo Volatility vs. Side Bias"
          description="T vs. CT Elo change per match — requires per-match time-series endpoint."
          height={180}
        />
        <ComingSoonPanel
          chartName="Rolling Win Rate"
          description="10-match moving window win percentage — requires per-match time-series endpoint."
          height={180}
        />
      </div>
    </section>
  );
};

export default EloSection;
