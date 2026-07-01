import type { Weapon } from "./weapon";

/**
 * A weapon that has been placed into a loadout slot.
 * uniqueId is a stable per-instance identifier used by DnD kit and React
 * keys to distinguish multiple copies of the same base weapon.
 */
export type LoadoutItem = Weapon & { uniqueId: string };

/** The two-sided loadout structure persisted by /api/loadout. */
export interface Loadout {
  tLoadout: Weapon[];
  ctLoadout: Weapon[];
}
