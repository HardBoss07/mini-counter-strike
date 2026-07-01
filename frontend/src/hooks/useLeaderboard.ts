import { useState, useEffect } from "react";
import { api } from "../utils/api";
import type { LeaderboardEntry } from "../types/user";

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches the global ELO leaderboard.
 */
export function useLeaderboard(): UseLeaderboardResult {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .getLeaderboard()
      .then((data) => {
        if (isMounted) {
          setLeaderboard(data);
          setLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load leaderboard";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { leaderboard, loading, error };
}
