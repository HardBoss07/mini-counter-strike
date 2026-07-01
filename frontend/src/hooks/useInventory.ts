import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { mapBackendWeapon } from "../types/weapon";
import type { Weapon } from "../types/weapon";

interface UseInventoryResult {
  weapons: Weapon[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches the full weapon catalog for the current user and maps each item
 * from the raw backend payload to the canonical Weapon shape.
 */
export function useInventory(): UseInventoryResult {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .getWeapons()
      .then((data) => {
        if (isMounted) {
          setWeapons(data.map(mapBackendWeapon));
          setLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load inventory";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { weapons, loading, error };
}
