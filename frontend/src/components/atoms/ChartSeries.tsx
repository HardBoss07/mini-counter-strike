import React from 'react';
import { Bar, Line, Area } from 'recharts';
import type { SeriesConfig } from '../../types/charts';

export const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#64748b'];

export const ChartSeries: React.FC<{ series: SeriesConfig; index: number }> = ({
  series,
  index,
}) => {
  const color = series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  const yAxisId = series.yAxisId || 'primary';

  switch (series.type) {
    case 'bar':
      return (
        <Bar
          key={series.key}
          yAxisId={yAxisId}
          dataKey={series.key}
          name={series.name || series.key}
          fill={color}
          stackId={series.stackId}
          opacity={series.fillOpacity || 0.8}
          barSize={12}
        />
      );
    case 'line':
      return (
        <Line
          key={series.key}
          yAxisId={yAxisId}
          type="monotone"
          dataKey={series.key}
          name={series.name || series.key}
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      );
    case 'area':
    default:
      return (
        <Area
          key={series.key}
          yAxisId={yAxisId}
          type="monotone"
          dataKey={series.key}
          name={series.name || series.key}
          stroke={color}
          fill={color}
          fillOpacity={series.fillOpacity || 0.3}
          strokeWidth={2}
        />
      );
  }
};
