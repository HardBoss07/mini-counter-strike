import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { mapBackendWeapon } from '../components/molecules/WeaponCard';
import type { Weapon } from '../components/molecules/WeaponCard';

const cache = new Map<number, Weapon>();

export const useWeaponData = (weaponId: number | undefined): Weapon | null => {
  const [weapon, setWeapon] = useState<Weapon | null>(weaponId ? cache.get(weaponId) || null : null);

  useEffect(() => {
    if (weaponId && !cache.has(weaponId)) {
      api.getWeapons()
        .then(weapons => {
          // Cache all fetched weapons to avoid repeated full-list fetches
          for (const raw of weapons) {
            const mapped = mapBackendWeapon(raw);
            cache.set(mapped.id, mapped);
          }
          setWeapon(cache.get(weaponId) || null);
        })
        .catch(console.error);
    } else if (weaponId && cache.has(weaponId)) {
        setWeapon(cache.get(weaponId) || null);
    }
  }, [weaponId]);

  return weapon;
};
