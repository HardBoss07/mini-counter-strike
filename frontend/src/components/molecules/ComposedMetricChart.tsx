import React from 'react';
import { ComposedChart, Tooltip, Legend } from 'recharts';
import type { BaseChartProps, AxisConfig, SeriesConfig } from '../../types/charts';
import { ChartContainer } from '../atoms/ChartContainer';
import { ChartGrid } from '../atoms/ChartGrid';
import { ChartXAxis, ChartYAxis } from '../atoms/ChartAxis';
import { ChartSeries } from '../atoms/ChartSeries';

export interface ComposedMetricChartProps extends BaseChartProps {
  xAxis: AxisConfig;
  primaryYAxis: AxisConfig;
  secondaryYAxis?: AxisConfig;
  series: SeriesConfig[];
}

export const ComposedMetricChart: React.FC<ComposedMetricChartProps> = ({
  data,
  xAxis,
  primaryYAxis,
  secondaryYAxis,
  series,
  height,
  width,
  showGrid = true,
  showLegend = false,
  className,
}) => (
  <ChartContainer height={height} width={width} className={className}>
    <ComposedChart data={data}>
      {showGrid && <ChartGrid />}
      <ChartXAxis {...xAxis} />
      <ChartYAxis yAxisId="primary" {...primaryYAxis} />
      {secondaryYAxis && <ChartYAxis yAxisId="secondary" {...secondaryYAxis} />}
      <Tooltip />
      {showLegend && <Legend />}
      {series.map((s, idx) => (
        <ChartSeries key={s.key} series={s} index={idx} />
      ))}
    </ComposedChart>
  </ChartContainer>
);
