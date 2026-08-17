# Charts Overview

## 1. Elo Rating & Skill Progression

| Metric / Goal                       | Complexity | SQL Source                                       | Recharts Component             | Visual Implementation & Logic                                                                                                   |
| ----------------------------------- | ---------- | ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Elo Trend Over Time**             | Basic      | `elo_history` (`recorded_at`, `elo_after`)       | `<AreaChart>` or `<LineChart>` | Smooth curve (`type="monotone"`), gradient fill under line, custom tooltip showing `elo_change` per match.                      |
| **Rank Distribution / Tier Spread** | Basic      | `app_user` (`elo`)                               | `<BarChart>` (Histogram)       | Group Elo into bins (e.g. 800-1000, 1000-1200) on X-axis, user count on Y-axis.                                                 |
| **Elo Trend vs. Match K/D Ratio**   | Advanced   | `elo_history` + `match_player_stats`             | `<ComposedChart>`              | **Line** (`elo_after`) on primary Y-axis mapped over time, paired with dual **Bars** (`kills` vs `deaths`) on secondary Y-axis. |
| **Elo Volatility vs. Side Bias**    | Advanced   | `elo_history` + `match_player_stats`             | `<LineChart>`                  | Two separate lines tracking `elo_change` per match filtered by `side = 'T'` vs `side = 'CT'` to spot side imbalance.            |
| **Rolling Winrate Over Time**       | Advanced   | `match_player_stats` (`created_at`, `is_winner`) | `<AreaChart>`                  | Calculate a 10-match moving window win percentage ($0-100\%$) on backend and plot as a smooth curve with green/red baseline.    |

## 2. Match History, Combat & Performance

| Metric / Goal                           | Complexity | SQL Source                                                            | Recharts Component                 | Visual Implementation & Logic                                                                                        |
| --------------------------------------- | ---------- | --------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Win / Loss / Draw Split**             | Basic      | `user_stats_summary` (`matches_won`, `matches_lost`, `matches_drawn`) | `<PieChart>` or `<RadialBarChart>` | Donut layout (`innerRadius={60}`, `outerRadius={80}`) with distinct accent colors (Green/Red/Slate).                 |
| **K/D & Damage per Match**              | Basic      | `match_player_stats` (`kills`, `deaths`, `damage_dealt`)              | `<ComposedChart>`                  | Dual-axis layout: **Bars** for `damage_dealt` (Y-Left) and **Lines** for `kills` / `deaths` (Y-Right).               |
| **Side Bias (T vs. CT Wins)**           | Basic      | `match_player_stats` (`side`, `rounds_won`)                           | Horizontal Stacked `<BarChart>`    | 100% stacked bar comparison showing round win rate on Terrorist vs. Counter-Terrorist sides.                         |
| **Damage Dealt vs. Taken Differential** | Advanced   | `match_player_stats` (`damage_dealt`, `damage_taken`)                 | Split `<AreaChart>`                | Two overlapping area paths (`damage_dealt` in blue, `damage_taken` in red) across recent matches to show net impact. |
| **Crit Rate Progression vs. Win Rate**  | Advanced   | `match_player_stats` (`crits_landed`, `is_winner`)                    | `<ComposedChart>`                  | **Bar** for total critical hits landed per match overlayed with a **Line** showing cumulative match result outcome.  |

## 3. Weapon Arsenal & Loadout Analytics

| Metric / Goal                           | Complexity | SQL Source                                               | Recharts Component      | Visual Implementation & Logic                                                                                         |
| --------------------------------------- | ---------- | -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Most Used Weapons**                   | Basic      | `match_weapon_stats` (`template_id`, `times_used`)       | Horizontal `<BarChart>` | Weapon names on Y-axis, `times_used` on X-axis sorted descending for readability.                                     |
| **Weapon Combat Profile**               | Basic      | `weapon_template` + `match_weapon_stats`                 | `<RadarChart>`          | Multi-axis spider chart comparing selected weapon stats across 5 metrics (Damage, Usage, Crits, Kills, Energy Cost).  |
| **Weapon Efficiency Index**             | Advanced   | `match_weapon_stats` + `weapon_template`                 | `<ScatterChart>`        | **X-axis**: Total Damage. **Y-axis**: Total Kills. **Z-axis (Node Size)**: Crits Landed. Displays sweet-spot weapons. |
| **Side-Specific Weapon Winrate**        | Advanced   | `match_weapon_stats` + `match_player_stats`              | Grouped `<BarChart>`    | Y-axis lists weapon names; X-axis displays side-by-side win percentage when weapon was used on T vs CT side.          |
| **Damage Output per Energy Cost Ratio** | Advanced   | `match_weapon_stats` + `weapon_template` (`energy_cost`) | `<BarChart>`            | Horizontal bar showing average `damage_dealt / energy_cost` per round to evaluate eco-weapon effectiveness.           |

## 4. Gacha, Economy & Inventory

| Metric / Goal                         | Complexity | SQL Source                                                        | Recharts Component | Visual Implementation & Logic                                                                                        |
| ------------------------------------- | ---------- | ----------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Inventory Rarity Breakdown**        | Basic      | `user_weapon_instance` $\rightarrow$ `weapon_template` (`rarity`) | `<PieChart>`       | Colors matched directly to rarity tiers (Base Grade = Gray, Classified = Pink, Covert = Red).                        |
| **Cases Unboxed Over Time**           | Basic      | `user_cases` (`is_opened`) aggregated by date                     | `<BarChart>`       | Vertical bar chart showing daily or weekly case openings.                                                            |
| **Unboxing Milestones vs. Elo Shift** | Advanced   | `elo_history` + `user_cases` (`is_opened`)                        | `<ComposedChart>`  | Primary **Line** for Elo trajectory over time, marked with custom **ReferenceDots** on dates when cases were opened. |

## Code Templates

### Basic: Elo Trajectory (`<AreaChart>`)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={eloData}>
    <defs>
      <linearGradient id="eloGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="recorded_at" stroke="#64748b" fontSize={12} tickLine={false} />
    <YAxis
      domain={['dataMin - 50', 'dataMax + 50']}
      stroke="#64748b"
      fontSize={12}
      tickLine={false}
    />
    <Tooltip content={<CustomTooltip />} />
    <Area
      type="monotone"
      dataKey="elo_after"
      stroke="#3b82f6"
      strokeWidth={2}
      fill="url(#eloGrad)"
    />
  </AreaChart>
</ResponsiveContainer>
```

### Advanced: Elo Trajectory + Match K/D Overlay (`<ComposedChart>`)

```tsx
<ResponsiveContainer width="100%" height={350}>
  <ComposedChart data={performanceTimeline}>
    <XAxis dataKey="recorded_at" stroke="#64748b" fontSize={12} tickLine={false} />
    <YAxis
      yAxisId="elo"
      domain={['dataMin - 50', 'dataMax + 50']}
      orientation="left"
      stroke="#3b82f6"
      fontSize={12}
      tickLine={false}
    />
    <YAxis yAxisId="kd" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} />
    <Tooltip content={<CustomTooltip />} />
    <Bar yAxisId="kd" dataKey="kills" fill="#10b981" opacity={0.6} barSize={12} />
    <Bar yAxisId="kd" dataKey="deaths" fill="#ef4444" opacity={0.6} barSize={12} />
    <Line
      yAxisId="elo"
      type="monotone"
      dataKey="elo_after"
      stroke="#3b82f6"
      strokeWidth={3}
      dot={false}
    />
  </ComposedChart>
</ResponsiveContainer>
```

### Advanced: Weapon Efficiency Matrix (`<ScatterChart>`)

```tsx
<ResponsiveContainer width="100%" height={350}>
  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
    <XAxis
      type="number"
      dataKey="total_damage"
      name="Damage"
      stroke="#64748b"
      fontSize={12}
      unit=" hp"
    />
    <YAxis
      type="number"
      dataKey="total_kills"
      name="Kills"
      stroke="#64748b"
      fontSize={12}
      unit=" kills"
    />
    <ZAxis type="number" dataKey="total_crits" range={[50, 400]} name="Crits" />
    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
    <Scatter name="Weapons" data={weaponEfficiencyData} fill="#8b5cf6" />
  </ScatterChart>
</ResponsiveContainer>
```

### Quick Reference Map

- Elo Progression ──► <AreaChart> (Basic)
- Rank Distribution ──► <BarChart> (Basic)
- Elo + K/D Correlation ──► <ComposedChart> (Advanced)
- Damage vs. Kills Matrix ──► <ScatterChart> (Advanced)
- Top Used Weapons ──► Horizontal <BarChart> (Basic)
- Weapon Stat Profile ──► <RadarChart> (Basic)
- Win / Loss Split ──► Donut <PieChart> (Basic)
- Unboxing vs. Elo Shift ──► <ComposedChart> + ReferenceDots (Advanced)
