import React from 'react';
import { XAxis as RechartsXAxis, YAxis as RechartsYAxis, ZAxis as RechartsZAxis } from 'recharts';
import type { AxisConfig } from '../../types/charts';

export const ChartXAxis: React.FC<AxisConfig & { type?: 'number' | 'category' }> = ({
  dataKey,
  unit,
  type,
}) => (
  <RechartsXAxis
    dataKey={dataKey}
    stroke="#64748b"
    fontSize={12}
    tickLine={false}
    unit={unit}
    type={type}
  />
);

export const ChartYAxis: React.FC<
  AxisConfig & { yAxisId?: string; type?: 'number' | 'category' }
> = ({ dataKey, unit, domain, orientation = 'left', yAxisId = 'primary', type }) => (
  <RechartsYAxis
    yAxisId={yAxisId}
    dataKey={dataKey}
    stroke="#64748b"
    fontSize={12}
    tickLine={false}
    domain={domain}
    unit={unit}
    orientation={orientation}
    type={type}
  />
);

export const ChartZAxis: React.FC<AxisConfig> = ({ dataKey, label }) => (
  <RechartsZAxis dataKey={dataKey} range={[50, 400]} name={label} />
);
