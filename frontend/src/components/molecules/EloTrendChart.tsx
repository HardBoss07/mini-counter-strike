import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip } from 'recharts';
import type { EloHistoryPoint } from '../../types/stats';
import { ChartContainer } from '../atoms/ChartContainer';
import { ChartGrid } from '../atoms/ChartGrid';
import { ChartXAxis, ChartYAxis } from '../atoms/ChartAxis';

const GRADIENT_ID = 'eloAreaGradient';
const ELO_COLOR = '#3b82f6';

interface EloTooltipPayload {
  eloAfter: number;
  eloChange: number;
  formattedDate: string;
}

interface EloTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: EloTooltipPayload }>;
}

const EloCustomTooltip: React.FC<EloTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const changeSign = point.eloChange >= 0 ? '+' : '';
  const changeColor = point.eloChange >= 0 ? 'text-green-400' : 'text-red-400';
  return (
    <div className="rounded border border-white/10 bg-tactical-dark px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400">{point.formattedDate}</p>
      <p className="font-bold text-white">
        ELO: <span className="text-tactical-accent">{point.eloAfter}</span>
      </p>
      <p className={`font-mono ${changeColor}`}>
        {changeSign}
        {point.eloChange}
      </p>
    </div>
  );
};

interface EloTrendChartProps {
  data: EloHistoryPoint[];
  height?: number;
}

/**
 * Area chart displaying Elo rating over time with gradient fill.
 * Assembled directly from atoms (not via ComposedMetricChart) because the
 * gradient <defs> block must live inside the <AreaChart> root element.
 *
 * Data is memoized: ISO timestamps are pre-formatted to "MMM DD" display
 * strings so recharts never receives raw ISO-8601 values.
 */
export const EloTrendChart: React.FC<EloTrendChartProps> = ({ data, height = 300 }) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        formattedDate: new Date(point.recordedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [data],
  );

  const domain = useMemo<[string, string]>(() => ['dataMin - 50', 'dataMax + 50'], []);

  return (
    <ChartContainer height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ELO_COLOR} stopOpacity={0.4} />
            <stop offset="95%" stopColor={ELO_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <ChartGrid />
        <ChartXAxis dataKey="formattedDate" />
        <ChartYAxis domain={domain} />
        <Tooltip content={<EloCustomTooltip />} />
        <Area
          type="monotone"
          dataKey="eloAfter"
          name="ELO"
          stroke={ELO_COLOR}
          strokeWidth={2}
          fill={`url(#${GRADIENT_ID})`}
        />
      </AreaChart>
    </ChartContainer>
  );
};
