import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

interface UseMatchmakingResult {
  isCancelling: boolean;
  cancel: () => Promise<void>;
}

/**
 * Manages the full matchmaking lifecycle:
 * - Joins the queue on mount.
 * - Polls queue status at 500 ms intervals.
 * - Navigates to the battle view when a match is found.
 * - Leaves the queue on unmount (unless a match was found).
 * - Exposes an explicit cancel action.
 */
export function useMatchmaking(): UseMatchmakingResult {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const matchFoundRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let ticketId: number | undefined;
    let intervalHandle: ReturnType<typeof setInterval> | undefined;

    const pollStatus = (): void => {
      if (ticketId === undefined) return;

      intervalHandle = setInterval(async () => {
        if (!isMounted) {
          clearInterval(intervalHandle);
          return;
        }

        try {
          const result = await api.getQueueStatus(ticketId!);
          if (result.status === "MATCH_FOUND" && result.matchId !== undefined) {
            matchFoundRef.current = true;
            clearInterval(intervalHandle);
            navigate(`/battle/${result.matchId}`);
          }
        } catch (pollError: unknown) {
          console.error("Error polling queue status:", pollError);
        }
      }, 500);
    };

    const startQueue = async (): Promise<void> => {
      try {
        const response = await api.queueMatch();

        if (!isMounted) return;

        ticketId = response.ticketId;
        pollStatus();
      } catch (queueError: unknown) {
        console.error("Failed to join matchmaking queue:", queueError);
      }
    };

    startQueue();

    return () => {
      isMounted = false;
      if (intervalHandle !== undefined) {
        clearInterval(intervalHandle);
      }
      if (!matchFoundRef.current) {
        api
          .leaveQueue()
          .catch((leaveError: unknown) =>
            console.error("Failed to leave queue on cleanup:", leaveError),
          );
      }
    };
  }, [navigate]);

  const cancel = async (): Promise<void> => {
    setIsCancelling(true);
    try {
      await api.leaveQueue();
      matchFoundRef.current = true;
      navigate("/");
    } catch (cancelError: unknown) {
      console.error("Failed to cancel matchmaking:", cancelError);
      setIsCancelling(false);
    }
  };

  return { isCancelling, cancel };
}
