import React from 'react';

interface ChartSectionTitleProps {
  title: string;
  subtitle?: string;
}

/**
 * Standardised section heading used above every chart group in the Stats view.
 */
export const ChartSectionTitle: React.FC<ChartSectionTitleProps> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h2>
    {subtitle && <p className="mt-0.5 text-[11px] text-gray-600">{subtitle}</p>}
  </div>
);
