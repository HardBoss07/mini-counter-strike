import type { ReactNode } from 'react';

export type ChartDataRecord = Record<string, any>;

export type ChartType =
  'area' | 'bar' | 'horizontal-bar' | 'composed' | 'pie' | 'scatter' | 'radar';

export interface ChartSeriesConfig {
  key: string;
  name?: string;
  color?: string;
  type?: 'bar' | 'line' | 'area';
  yAxisId?: string | number;
  stackId?: string;
  fillOpacity?: number;
}

export interface AxisConfig {
  dataKey?: string;
  label?: string;
  unit?: string;
  domain?: [number | string, number | string];
  orientation?: 'left' | 'right';
}

export interface ChartWrapperProps {
  type: ChartType;
  data: ChartDataRecord[];
  series: ChartSeriesConfig[];

  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  secondaryYAxis: AxisConfig;
  zAxis?: AxisConfig;

  nameKey?: string;

  height?: number | string;
  width?: number | string;
  customToolTip?: ReactNode | ((props: any) => ReactNode);
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}
