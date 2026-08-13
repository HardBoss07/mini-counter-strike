import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { api } from '../utils/api';
import type {
  PlayerStatsSummary,
  EloHistoryPoint,
  WeaponUsageStat,
  EloHistoryQueryFilters,
} from '../types/stats';

export interface UsePlayerStatsResult {
  summary: PlayerStatsSummary | null;
  summaryLoading: boolean;
  summaryError: string | null;

  eloHistory: EloHistoryPoint[];
  eloHistoryLoading: boolean;
  eloHistoryError: string | null;

  topWeapons: WeaponUsageStat[];
  topWeaponsLoading: boolean;
  topWeaponsError: string | null;

  eloFilters: EloHistoryQueryFilters;
  setEloFilters: Dispatch<SetStateAction<EloHistoryQueryFilters>>;
}

/**
 * Fires all three stats endpoints in parallel for a given userId.
 * Each endpoint has its own independent loading / error state so sections
 * can render progressively as data arrives.
 *
 * AbortController cleanup in every effect prevents stale state updates
 * when userId or eloFilters change rapidly.
 *
 * Skips all fetches when userId is 0 (not yet resolved from the auth layer).
 */
export function usePlayerStats(userId: number): UsePlayerStatsResult {
  const [summary, setSummary] = useState<PlayerStatsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([]);
  const [eloHistoryLoading, setEloHistoryLoading] = useState<boolean>(true);
  const [eloHistoryError, setEloHistoryError] = useState<string | null>(null);

  const [topWeapons, setTopWeapons] = useState<WeaponUsageStat[]>([]);
  const [topWeaponsLoading, setTopWeaponsLoading] = useState<boolean>(true);
  const [topWeaponsError, setTopWeaponsError] = useState<string | null>(null);

  const [eloFilters, setEloFilters] = useState<EloHistoryQueryFilters>({});

  // --- Summary ---
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    setSummaryLoading(true);
    setSummaryError(null);

    api
      .getPlayerStatsSummary(userId)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSummary(data);
          setSummaryLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error ? fetchError.message : 'Failed to load stats summary';
          setSummaryError(message);
          setSummaryLoading(false);
        }
      });

    return () => controller.abort();
  }, [userId]);

  // --- Elo History (re-fires when eloFilters change) ---
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    setEloHistoryLoading(true);
    setEloHistoryError(null);

    api
      .getEloHistory(userId, eloFilters)
      .then((data) => {
        if (!controller.signal.aborted) {
          setEloHistory(data);
          setEloHistoryLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error ? fetchError.message : 'Failed to load Elo history';
          setEloHistoryError(message);
          setEloHistoryLoading(false);
        }
      });

    return () => controller.abort();
  }, [userId, eloFilters]);

  // --- Top Weapons ---
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    setTopWeaponsLoading(true);
    setTopWeaponsError(null);

    api
      .getTopWeapons(userId)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTopWeapons(data);
          setTopWeaponsLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error ? fetchError.message : 'Failed to load weapon stats';
          setTopWeaponsError(message);
          setTopWeaponsLoading(false);
        }
      });

    return () => controller.abort();
  }, [userId]);

  return {
    summary,
    summaryLoading,
    summaryError,
    eloHistory,
    eloHistoryLoading,
    eloHistoryError,
    topWeapons,
    topWeaponsLoading,
    topWeaponsError,
    eloFilters,
    setEloFilters,
  };
}
