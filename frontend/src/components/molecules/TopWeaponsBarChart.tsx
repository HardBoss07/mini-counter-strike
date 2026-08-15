import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeaponUsageStat } from '../../types/stats';

interface TopWeaponsBarChartProps {
  data: WeaponUsageStat[];
  height?: number;
}

interface WeaponBarDatum {
  weaponName: string;
  timesUsed: number;
}

/**
 * Horizontal bar chart listing weapons sorted descending by usage.
 * Assembled from recharts primitives directly because recharts' horizontal
 * layout requires <BarChart layout="vertical"> with swapped axis types -
 * a configuration that ComposedMetricChart does not expose.
 *
 * Data sorting and slicing is memoized.
 */
export const TopWeaponsBarChart: React.FC<TopWeaponsBarChartProps> = ({ data, height = 260 }) => {
  const chartData = useMemo<WeaponBarDatum[]>(
    () =>
      [...data]
        .sort((first, second) => second.totalTimesUsed - first.totalTimesUsed)
        .map((weapon) => ({
          weaponName: weapon.weaponName,
          timesUsed: weapon.totalTimesUsed,
        })),
    [data],
  );

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
        >
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="weaponName"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#0d1117',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(value: any) => [
              value !== undefined && value !== null ? `${value} uses` : '-',
              'Times Used',
            ]}
          />
          <Bar
            dataKey="timesUsed"
            name="Times Used"
            fill="#8b5cf6"
            radius={[0, 4, 4, 0]}
            barSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
