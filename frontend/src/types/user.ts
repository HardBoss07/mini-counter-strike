/**
 * Full user profile returned by /api/user/me.
 * Also used by AuthContext for richer user state.
 */
export interface UserProfile {
  id: number;
  username: string;
  elo: number;
  credits: number;
  caseCount: number;
}

/**
 * A single row in the global leaderboard returned by /api/leaderboard.
 */
export interface LeaderboardEntry {
  username: string;
  elo: number;
}

/**
 * Minimal user identity stored in AuthContext after login/register.
 * Kept lean so it can be populated from the JWT without an extra API call.
 */
export interface AuthUser {
  username: string;
}
