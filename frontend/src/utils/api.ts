import type { Weapon } from "../components/molecules/WeaponCard";

const BASE_URL = ""; // Proxied by Vite in development

/**
 * Generic API request wrapper using native fetch.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // 1. Add Content-Type if body exists
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 2. Add JWT token from localStorage
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 403) {
    throw new Error("Unauthorized: 403 Forbidden");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const json = JSON.parse(errorBody);
      if (json.message) message = json.message;
      else if (json.error) message = json.error;
    } catch (e) {
      if (errorBody) message = errorBody;
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export interface MatchStateResponse {
  round: number;
  playerAStatus: string; // e.g., "HP:100"
  playerBStatus: string; // e.g., "HP:100"
  lastLog: string;
  status: "IN_PROGRESS" | "COMPLETED";
  playerHand?: any[]; // Holds the current live hand if ongoing
  isMyTurn?: boolean;
  playerAUsername: string; // Added field
  playerBUsername: string; // Added field
}

/**
 * Service functions for specific API endpoints.
 */
export const api = {
  /**
   * Auth Endpoints
   */
  login: (username: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Catalog
   */
  getWeapons: () =>
    apiFetch<Weapon[]>("/api/inventory/weapons", { method: "GET" }),

  getUserProfile: () =>
    apiFetch<{
      id: number;
      username: string;
      elo: number;
      credits: number;
      caseCount: number;
    }>("/api/user/me", { method: "GET" }),
  getLeaderboard: () =>
    apiFetch<{ username: string; elo: number }[]>("/api/leaderboard", {
      method: "GET",
    }),
  openCase: () =>
    apiFetch<{ weaponName: string; rarity: string; imageUrl: string }>(
      "/api/economy/cases/open",
      { method: "POST" },
    ),
  queueMatch: () =>
    apiFetch<{ ticketId: number }>("/api/match/queue", { method: "POST" }),
  leaveQueue: () =>
    apiFetch<void>("/api/match/queue/leave", { method: "POST" }),
  getQueueStatus: (ticketId: number) =>
    apiFetch<{ status: string; matchId?: number }>(
      `/api/match/queue/status?ticketId=${ticketId}`,
      { method: "GET" },
    ),
  getMatchState: (matchId: number) =>
    apiFetch<any>(`/api/match/${matchId}/state`, { method: "GET" }),
  submitAction: (matchId: number, weaponId: number) =>
    apiFetch<void>(`/api/match/${matchId}/action`, {
      method: "POST",
      body: JSON.stringify({ weaponId }),
    }),
  getMatchLogs: (matchId: number) =>
    apiFetch<any[]>(`/api/match/${matchId}/logs`, { method: "GET" }),

  getLoadouts: () =>
    apiFetch<{ tLoadout: Weapon[]; ctLoadout: Weapon[] }>("/api/loadout", {
      method: "GET",
    }),
  saveLoadouts: (tLoadout: Weapon[], ctLoadout: Weapon[]) =>
    apiFetch<any>("/api/loadout/save", {
      method: "POST",
      body: JSON.stringify({
        tLoadoutIds: tLoadout.map((w) => w.id),
        ctLoadoutIds: ctLoadout.map((w) => w.id),
      }),
    }),

  surrenderMatch: (matchId: number) =>
    apiFetch<void>(`/api/match/${matchId}/surrender`, {
      method: "POST",
    }),
};

export const subscribeToMatchStream = (
  matchId: string | number,
  onUpdate: (data: any) => void
) => {
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

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5).trim());
              onUpdate(data);
            } catch (e) {
              console.error("Error parsing SSE JSON:", e);
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") console.error("SSE connection error:", err);
    });

  return () => controller.abort();
};