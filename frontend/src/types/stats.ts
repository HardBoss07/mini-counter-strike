/**
 * Aggregated player lifetime statistics returned by the backend.
 * Maps to PlayerStatsSummaryDTO.
 */
export interface PlayerStatsSummary {
  userId: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalCritsLanded: number;
  casesOpened: number;
  favoriteWeaponName: string | null;
  favoriteWeaponImageUrl: string | null;
}

/**
 * Single data point for Elo charting over time.
 * Maps to EloHistoryPointDTO. Compatible with Recharts / Chart.js.
 */
export interface EloHistoryPoint {
  id: number;
  matchId: number | null;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  recordedAt: string; // ISO-8601 string representation of LocalDateTime
}

/**
 * Breakdown of player performance with a specific weapon template.
 * Maps to WeaponUsageStatDTO.
 */
export interface WeaponUsageStat {
  templateId: number;
  weaponName: string;
  imageUrl: string;
  totalTimesUsed: number;
  totalDamageDealt: number;
  totalKills: number;
  totalCritsLanded: number;
}

/** Query parameters for pagination/filtering of Elo history graphs. */
export interface EloHistoryQueryFilters {
  days?: number;
  limit?: number;
}
