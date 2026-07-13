import type { Weapon } from "../types/weapon";
import type { MatchStateResponse } from "../types/match";
import type { UserProfile, LeaderboardEntry } from "../types/user";
import type { Loadout } from "../types/loadout";
import type { UserCaseInstance, OpenCaseResponse } from "../types/case";

const BASE_URL = ""; // Proxied by Vite in development

/**
 * Generic API request wrapper using native fetch.
 * Automatically attaches the JWT from localStorage and sets Content-Type.
 * Throws a descriptive Error on any non-2xx response.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers ?? {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 403) {
    throw new Error("Unauthorized: 403 Forbidden");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const json = JSON.parse(errorBody) as Record<string, unknown>;
      if (typeof json.message === "string") message = json.message;
      else if (typeof json.error === "string") message = json.error;
    } catch {
      if (errorBody) message = errorBody;
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/**
 * Service functions for all API endpoints, grouped by domain.
 */
export const api = {
  // --- Auth ---

  login: (username: string, password: string): Promise<{ token: string }> =>
    apiFetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string): Promise<{ token: string }> =>
    apiFetch<{ token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // --- User ---

  getUserProfile: (): Promise<UserProfile> =>
    apiFetch<UserProfile>("/api/user/me", { method: "GET" }),

  // --- Leaderboard ---

  getLeaderboard: (): Promise<LeaderboardEntry[]> =>
    apiFetch<LeaderboardEntry[]>("/api/leaderboard", { method: "GET" }),

  // --- Catalog / Inventory ---

  getWeapons: (): Promise<Weapon[]> =>
    apiFetch<Weapon[]>("/api/inventory/weapons", { method: "GET" }),

  getUserCases: (): Promise<UserCaseInstance[]> =>
    apiFetch<UserCaseInstance[]>("/api/inventory/cases", { method: "GET" }),

  // --- Economy ---

  openCase: (userCaseInstanceId: number): Promise<OpenCaseResponse> =>
    apiFetch<OpenCaseResponse>(
      `/api/economy/cases/${userCaseInstanceId}/open`,
      { method: "POST" },
    ),

  // --- Loadout ---

  getLoadouts: (): Promise<Loadout> =>
    apiFetch<Loadout>("/api/loadout", { method: "GET" }),

  saveLoadouts: (tLoadout: Weapon[], ctLoadout: Weapon[]): Promise<void> =>
    apiFetch<void>("/api/loadout/save", {
      method: "POST",
      body: JSON.stringify({
        tLoadoutIds: tLoadout.map((weapon) => weapon.id),
        ctLoadoutIds: ctLoadout.map((weapon) => weapon.id),
      }),
    }),

  // --- Match ---

  queueMatch: (): Promise<{ ticketId: number }> =>
    apiFetch<{ ticketId: number }>("/api/match/queue", { method: "POST" }),

  leaveQueue: (): Promise<void> =>
    apiFetch<void>("/api/match/queue/leave", { method: "POST" }),

  getQueueStatus: (
    ticketId: number,
  ): Promise<{ status: string; matchId?: number }> =>
    apiFetch<{ status: string; matchId?: number }>(
      `/api/match/queue/status?ticketId=${ticketId}`,
      { method: "GET" },
    ),

  getMatchState: (matchId: number): Promise<MatchStateResponse> =>
    apiFetch<MatchStateResponse>(`/api/match/${matchId}/state`, {
      method: "GET",
    }),

  getMatchLogs: (matchId: number): Promise<string[]> =>
    apiFetch<string[]>(`/api/match/${matchId}/logs`, { method: "GET" }),

  submitAction: (matchId: number, weaponId: number): Promise<void> =>
    apiFetch<void>(`/api/match/${matchId}/action`, {
      method: "POST",
      body: JSON.stringify({ weaponId }),
    }),

  surrenderMatch: (matchId: number): Promise<void> =>
    apiFetch<void>(`/api/match/${matchId}/surrender`, { method: "POST" }),

  /**
   * Fires a keepalive surrender request suitable for use inside a
   * `beforeunload` event handler. Uses the native fetch keepalive flag so
   * the browser dispatches the request even as the tab is closing.
   *
   * NOTE: This cannot use the async apiFetch wrapper because beforeunload
   * handlers must be synchronous. Auth header assembly is intentionally
   * duplicated here to keep this self-contained.
   */
  keepaliveSurrender: (matchId: string | number): void => {
    const token = localStorage.getItem("token");
    fetch(`/api/match/${matchId}/surrender`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
      keepalive: true,
    }).catch((error: unknown) => {
      console.error("keepaliveSurrender failed:", error);
    });
  },
};

/**
 * Opens a persistent SSE connection to the match stream endpoint and calls
 * onUpdate each time a valid MatchStateResponse event is received.
 *
 * Returns a cleanup function that aborts the connection.
 */
export function subscribeToMatchStream(
  matchId: string | number,
  onUpdate: (data: MatchStateResponse) => void,
): () => void {
  const token = localStorage.getItem("token");
  const controller = new AbortController();

  fetch(`/api/match/${matchId}/stream`, {
    headers: token ? { Authorization: "Bearer " + token } : {},
    signal: controller.signal,
  })
    .then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(
                line.slice(5).trim(),
              ) as MatchStateResponse;
              onUpdate(data);
            } catch (parseError: unknown) {
              console.error("Error parsing SSE JSON:", parseError);
            }
          }
        }
      }
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("SSE connection error:", error);
      }
    });

  return () => controller.abort();
}
