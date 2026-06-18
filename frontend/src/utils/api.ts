import type { Weapon } from '../components/molecules/WeaponCard';

const BASE_URL = ''; // Proxied by Vite in development

/**
 * Generic API request wrapper using native fetch.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // 1. Add Content-Type if body exists
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Add JWT token if it exists in localStorage
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const json = JSON.parse(errorBody);
      if (json.message) message = json.message;
    } catch (e) {
      if (errorBody) message = errorBody;
    }
    throw new Error(message);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Service functions for specific API endpoints.
 */
export const api = {
  /**
   * Auth Endpoints
   */
  login: (username: string, password: string) => 
    apiFetch<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    apiFetch<{ token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Catalog
   */
  getWeapons: () => apiFetch<Weapon[]>('/api/weapons'),

  /**
   * Loadout
   */
  saveLoadouts: (loadouts: { side: 'T' | 'CT', items: Weapon[] }[]) =>
    apiFetch<any>('/api/loadout/save', {
      method: 'POST',
      body: JSON.stringify(loadouts),
    }),

  /**
   * Matches
   */
  queueMatch: (playerA: string, playerB: string) => 
    apiFetch<any>('/api/match/queue', {
      method: 'POST',
      body: JSON.stringify({ playerA, playerB }),
    }),

  submitTurn: (matchId: number, playerId: number, actionId: number) =>
    apiFetch<any>(`/api/match/${matchId}/turn`, {
      method: 'POST',
      body: JSON.stringify({ playerId, actionId }),
    }),
};
