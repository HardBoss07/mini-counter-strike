import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { mapBackendWeapon } from "../types/weapon";
import type { Weapon } from "../types/weapon";

const weaponCache = new Map<number, Weapon>();

/**
 * Fetches a single weapon by ID from the full weapon catalog.
 * Uses a module-level cache to avoid repeated full-list API calls across
 * multiple WeaponCard instances on the same page.
 */
export function useWeaponData(weaponId: number | undefined): Weapon | null {
  const [weapon, setWeapon] = useState<Weapon | null>(
    weaponId !== undefined ? (weaponCache.get(weaponId) ?? null) : null,
  );

  useEffect(() => {
    if (weaponId === undefined) return;

    if (weaponCache.has(weaponId)) {
      setWeapon(weaponCache.get(weaponId) ?? null);
      return;
    }

    api
      .getWeapons()
      .then((weapons) => {
        for (const raw of weapons) {
          const mapped = mapBackendWeapon(raw);
          weaponCache.set(mapped.id, mapped);
        }
        setWeapon(weaponCache.get(weaponId) ?? null);
      })
      .catch(console.error);
  }, [weaponId]);

  return weapon;
}
