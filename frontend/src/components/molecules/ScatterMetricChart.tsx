import React from 'react';
import { ScatterChart, Scatter, Tooltip } from 'recharts';
import type { BaseChartProps, AxisConfig } from '../../types/charts';
import { ChartContainer } from '../atoms/ChartContainer';
import { ChartGrid } from '../atoms/ChartGrid';
import { ChartXAxis, ChartYAxis, ChartZAxis } from '../atoms/ChartAxis';
import { DEFAULT_COLORS } from '../atoms/ChartSeries';

export interface ScatterMetricChartProps extends BaseChartProps {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  zAxis?: AxisConfig;
  seriesName?: string;
  color?: string;
}

export const ScatterMetricChart: React.FC<ScatterMetricChartProps> = ({
  data,
  xAxis,
  yAxis,
  zAxis,
  seriesName = 'Metrics',
  color = DEFAULT_COLORS[0],
  height,
  width,
  showGrid = true,
  className,
}) => (
  <ChartContainer height={height} width={width} className={className}>
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      {showGrid && <ChartGrid />}
      <ChartXAxis {...xAxis} type="number" />
      <ChartYAxis {...yAxis} type="number" />
      {zAxis && <ChartZAxis {...zAxis} />}
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Scatter name={seriesName} data={data} fill={color} />
    </ScatterChart>
  </ChartContainer>
);
