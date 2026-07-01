import { useState, useEffect } from "react";
import { api, subscribeToMatchStream } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import type { MatchStateResponse } from "../types/match";

interface UseMatchStreamResult {
  matchState: MatchStateResponse | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  /** The username of the player viewing this battle. */
  viewerUsername: string;
  submitAction: (weaponId: number) => Promise<void>;
  surrender: () => Promise<void>;
}

/**
 * Manages the full lifecycle of an active battle:
 * - Resolves the viewer's username from AuthContext (with API fallback).
 * - Opens and cleans up the SSE stream connection.
 * - Registers a beforeunload keepalive surrender to handle tab closure.
 * - Exposes submitAction and surrender mutation callbacks.
 */
export function useMatchStream(
  matchId: string | undefined,
): UseMatchStreamResult {
  const { user } = useAuth();

  const [matchState, setMatchState] = useState<MatchStateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerUsername, setViewerUsername] = useState<string>(
    user?.username ?? "",
  );

  // Resolve viewer identity: prefer AuthContext, fall back to API call.
  useEffect(() => {
    if (user?.username) {
      setViewerUsername(user.username);
      return;
    }

    api
      .getUserProfile()
      .then((profile) => {
        setViewerUsername(profile.username);
      })
      .catch((fetchError: unknown) => {
        console.error("Could not resolve viewer identity:", fetchError);
      });
  }, [user]);

  // SSE stream subscription.
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = subscribeToMatchStream(matchId, (newState) => {
      setMatchState(newState);
      setError(null);
      setLoading(false);
    });

    return unsubscribe;
  }, [matchId]);

  // Keepalive surrender on tab/window close.
  useEffect(() => {
    if (!matchId || !matchState || matchState.status === "COMPLETED") return;

    const handleBeforeUnload = (): void => {
      api.keepaliveSurrender(matchId);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [matchId, matchState]);

  const submitAction = async (weaponId: number): Promise<void> => {
    if (!matchId || submitting) return;
    try {
      setSubmitting(true);
      await api.submitAction(Number(matchId), weaponId);
      // The SSE stream pushes the updated state automatically.
    } catch (actionError: unknown) {
      console.error(actionError);
      setError("Failed to process battle action.");
    } finally {
      setSubmitting(false);
    }
  };

  const surrender = async (): Promise<void> => {
    if (!matchId) return;
    try {
      await api.surrenderMatch(Number(matchId));
    } catch (surrenderError: unknown) {
      console.error(surrenderError);
      // Navigation happens regardless of API success.
    }
  };

  return {
    matchState,
    loading,
    submitting,
    error,
    viewerUsername,
    submitAction,
    surrender,
  };
}
