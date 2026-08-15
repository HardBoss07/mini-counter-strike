import React from 'react';
import type { WeaponUsageStat } from '../../types/stats';
import { ChartSectionTitle } from '../atoms/ChartSectionTitle';
import { ChartSkeletonPanel } from '../atoms/ChartSkeletonPanel';
import { ComingSoonPanel } from '../atoms/ComingSoonPanel';
import { TopWeaponsBarChart } from '../molecules/TopWeaponsBarChart';
import { WeaponEfficiencyScatter } from '../molecules/WeaponEfficiencyScatter';

const BAR_HEIGHT = 260;
const SCATTER_HEIGHT = 300;
const STUB_HEIGHT = 200;

interface WeaponSectionProps {
  weapons: WeaponUsageStat[];
  loading: boolean;
  error: string | null;
}

/**
 * Weapon Arsenal section organism.
 *
 * Backed charts (2 endpoint-supported, both from /top-weapons):
 *   - Most Used Weapons horizontal BarChart
 *   - Weapon Efficiency Index ScatterChart (damage vs. kills, Z = crits)
 *
 * Coming-soon stubs (3 advanced charts requiring join with side data):
 *   - Weapon Combat Profile RadarChart
 *   - Side-Specific Weapon Win Rate
 *   - Damage Output per Energy Cost Ratio
 */
const WeaponSection: React.FC<WeaponSectionProps> = ({ weapons, loading, error }) => (
  <section aria-labelledby="weapon-section-heading">
    <ChartSectionTitle
      title="Weapon Arsenal"
      subtitle="Usage frequency and damage efficiency across your arsenal"
    />

    {error && (
      <div className="mb-4 border-l-4 border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )}

    {loading ? (
      <>
        <ChartSkeletonPanel height={BAR_HEIGHT} className="mb-4" />
        <ChartSkeletonPanel height={SCATTER_HEIGHT} />
      </>
    ) : weapons.length === 0 ? (
      <div className="mb-4 flex items-center justify-center rounded-lg border border-dashed border-white/10 py-12 text-sm text-gray-600">
        No weapon data yet. Complete a match to see your arsenal stats.
      </div>
    ) : (
      <>
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-600">
            Most Used Weapons
          </p>
          <TopWeaponsBarChart data={weapons} height={BAR_HEIGHT} />
        </div>
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-600">
            Weapon Efficiency Index
            <span className="ml-2 font-normal normal-case tracking-normal text-gray-700">
              - X: Damage &nbsp;|&nbsp; Y: Kills &nbsp;|&nbsp; Size: Crits
            </span>
          </p>
          <WeaponEfficiencyScatter data={weapons} height={SCATTER_HEIGHT} />
        </div>
      </>
    )}

    {/* Advanced chart stubs */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ComingSoonPanel
        chartName="Weapon Combat Profile"
        description="Radar spider chart across 5 metrics - requires weapon_template join."
        height={STUB_HEIGHT}
      />
      <ComingSoonPanel
        chartName="Side-Specific Weapon Win Rate"
        description="T vs. CT win % per weapon - requires match_player_stats join."
        height={STUB_HEIGHT}
      />
      <ComingSoonPanel
        chartName="Damage per Energy Cost"
        description="Eco-effectiveness ratio - requires weapon_template energy_cost join."
        height={STUB_HEIGHT}
      />
    </div>
  </section>
);

export default WeaponSection;
