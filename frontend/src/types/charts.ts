import type { ReactNode } from 'react';
import type { ResponsiveContainerProps } from 'recharts';

export type ChartDimension = ResponsiveContainerProps['width'];

export type ChartDataRecord = Record<string, any>;

export interface AxisConfig {
  dataKey?: string;
  unit?: string;
  domain?: [number | string, number | string];
  orientation?: 'left' | 'right';
  label?: string;
}

export interface SeriesConfig {
  key: string;
  name?: string;
  color?: string;
  type?: 'bar' | 'line' | 'area';
  yAxisId?: string | number;
  stackId?: string;
  fillOpacity?: number;
}

export interface BaseChartProps {
  data: ChartDataRecord[];
  height?: ChartDimension;
  width?: ChartDimension;
  showGrid?: boolean;
  showLegend?: boolean;
  customTooltip?: ReactNode | ((props: any) => ReactNode);
  className?: string;
}
