import React from 'react';
import { Lock } from 'lucide-react';

interface ComingSoonPanelProps {
  chartName: string;
  /** Optional description of what data the chart would display. */
  description?: string;
  height?: number;
  className?: string;
}

/**
 * Placeholder panel for advanced charts that are specified in Charts.md but
 * require backend endpoints not yet implemented. Signals intent without
 * showing broken or empty UI.
 */
export const ComingSoonPanel: React.FC<ComingSoonPanelProps> = ({
  chartName,
  description,
  height = 200,
  className = '',
}) => (
  <div
    className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] ${className}`}
    style={{ height }}
    aria-label={`${chartName} - coming soon`}
  >
    <Lock size={18} className="text-gray-600" />
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{chartName}</p>
      {description && <p className="mt-1 max-w-xs text-[11px] text-gray-700">{description}</p>}
      <p className="mt-2 font-mono text-[10px] text-gray-700">Coming soon</p>
    </div>
  </div>
);
