import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Legend } from 'recharts';
import type { BaseChartProps } from '../../types/charts';
import { ChartContainer } from '../atoms/ChartContainer';
import { DEFAULT_COLORS } from '../atoms/ChartSeries';

export interface PieBreakdownChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
}

export const PieBreakdownChart: React.FC<PieBreakdownChartProps> = ({
  data,
  dataKey,
  nameKey,
  height,
  width,
  showLegend = true,
  className,
}) => {
  // Map colors directly to data items to avoid deprecated <Cell />
  const styledData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [data]);

  return (
    <ChartContainer height={height} width={width} className={className}>
      <PieChart>
        <Tooltip />
        {showLegend && <Legend />}
        <Pie
          data={styledData}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
        />
      </PieChart>
    </ChartContainer>
  );
};
