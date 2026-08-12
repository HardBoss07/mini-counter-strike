import React from 'react';

interface ChartSkeletonPanelProps {
  /** Height in pixels — should match the chart it is replacing. */
  height?: number;
  className?: string;
}

/**
 * Animated shimmer placeholder rendered while a chart's data is loading.
 * Height matches the chart it replaces to prevent layout shift.
 */
export const ChartSkeletonPanel: React.FC<ChartSkeletonPanelProps> = ({
  height = 300,
  className = '',
}) => (
  <div
    className={`w-full animate-pulse rounded-lg bg-white/5 ${className}`}
    style={{ height }}
    aria-label="Loading chart..."
    role="status"
  >
    <div className="flex h-full flex-col justify-end gap-2 p-4">
      {/* Fake bar stubs to give chart-like visual rhythm */}
      {[0.7, 0.45, 0.85, 0.55, 0.65].map((scale, index) => (
        <div
          key={index}
          className="rounded bg-white/10"
          style={{ height: 8, width: `${scale * 100}%` }}
        />
      ))}
    </div>
  </div>
);
