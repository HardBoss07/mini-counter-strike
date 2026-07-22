import type { Weapon } from "./weapon";

/** Lifecycle state of a match. */
export type MatchStatus = "IN_PROGRESS" | "COMPLETED";

/**
 * A single item in the player's live hand during a battle round.
 * Extends Weapon so WeaponCard can render it directly.
 */
export type PlayerHandItem = Weapon;

/**
 * Canonical shape of a match state payload pushed by the SSE stream
 * (/api/match/:id/stream) and also returned by /api/match/:id/state.
 *
 * playerAStatus / playerBStatus are formatted as "HP:<value>" by the backend.
 */
export interface MatchStateResponse {
  round: number;
  /** Formatted as "HP:<value>" - use parseHp() to extract the number. */
  playerAStatus: string;
  /** Formatted as "HP:<value>" - use parseHp() to extract the number. */
  playerBStatus: string;
  lastLog: string;
  status: MatchStatus;
  /** The current player's live hand. Only present while the match is IN_PROGRESS. */
  playerHand?: PlayerHandItem[];
  isMyTurn?: boolean;
  playerAUsername: string;
  playerBUsername: string;
  /** Current energy for player A, as sent by the backend SSE stream. */
  playerAEnergy?: number;
  /** Current energy for player B, as sent by the backend SSE stream. */
  playerBEnergy?: number;
}

/**
 * Extracts the raw HP number string from a "HP:<value>" status string.
 * Returns "100" as a safe fallback if the format is unexpected.
 */
export function parseHp(statusString: string): string {
  if (statusString.includes(":")) {
    return statusString.split(":")[1] ?? "100";
  }
  return "100";
}
