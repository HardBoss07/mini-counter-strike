import React, { useMemo } from 'react';
import { ScatterMetricChart } from './ScatterMetricChart';
import type { WeaponUsageStat } from '../../types/stats';

interface WeaponEfficiencyScatterProps {
  data: WeaponUsageStat[];
  height?: number;
}

interface WeaponScatterDatum {
  weaponName: string;
  totalDamage: number;
  totalKills: number;
  totalCrits: number;
}

/**
 * Scatter chart mapping total damage (X) vs total kills (Y) with node size
 * proportional to crits landed (Z), one bubble per weapon.
 * Delegates to the existing ScatterMetricChart molecule.
 *
 * DTO → scatter datum projection is memoized.
 */
export const WeaponEfficiencyScatter: React.FC<WeaponEfficiencyScatterProps> = ({
  data,
  height = 300,
}) => {
  const chartData = useMemo<WeaponScatterDatum[]>(
    () =>
      data.map((weapon) => ({
        weaponName: weapon.weaponName,
        totalDamage: weapon.totalDamageDealt,
        totalKills: weapon.totalKills,
        totalCrits: weapon.totalCritsLanded,
      })),
    [data],
  );

  return (
    <ScatterMetricChart
      data={chartData}
      height={height}
      color="#8b5cf6"
      seriesName="Weapons"
      xAxis={{ dataKey: 'totalDamage', label: 'Damage', unit: ' hp' }}
      yAxis={{ dataKey: 'totalKills', label: 'Kills', unit: ' kills' }}
      zAxis={{ dataKey: 'totalCrits', label: 'Crits' }}
      showGrid
    />
  );
};
