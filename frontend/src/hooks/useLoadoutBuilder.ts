import { useState, useEffect, useCallback } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { api } from "../utils/api";
import { mapBackendWeapon } from "../types/weapon";
import type { Weapon } from "../types/weapon";
import type { LoadoutItem } from "../types/loadout";

type SaveStatus = "idle" | "saving" | "saved";

interface UseLoadoutBuilderResult {
  armoryWeapons: Weapon[];
  tLoadout: LoadoutItem[];
  ctLoadout: LoadoutItem[];
  activeWeapon: Weapon | null;
  loading: boolean;
  saveStatus: SaveStatus;
  error: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleRemoveItem: (uniqueId: string) => void;
  handleSave: () => Promise<void>;
}

function attachUniqueId(weapon: Weapon): LoadoutItem {
  return { ...weapon, uniqueId: `${weapon.id}-${crypto.randomUUID()}` };
}

function getBaseWeaponName(fullName: string): string {
  return fullName.split(" | ")[0];
}

/**
 * Manages all state and business logic for the LoadoutBuilder screen:
 * - Fetches the weapon catalog and saved loadouts in parallel on mount.
 * - Validates and applies drag-and-drop placement rules.
 * - Persists loadouts via api.saveLoadouts.
 */
export function useLoadoutBuilder(): UseLoadoutBuilderResult {
  const [armoryWeapons, setArmoryWeapons] = useState<Weapon[]>([]);
  const [tLoadout, setTLoadout] = useState<LoadoutItem[]>([]);
  const [ctLoadout, setCtLoadout] = useState<LoadoutItem[]>([]);
  const [activeWeapon, setActiveWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string): void => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async (): Promise<void> => {
      try {
        const [weaponsData, loadoutData] = await Promise.all([
          api.getWeapons(),
          api.getLoadouts(),
        ]);

        if (!isMounted) return;

        setArmoryWeapons(weaponsData.map(mapBackendWeapon));

        if (loadoutData.tLoadout) {
          setTLoadout(
            loadoutData.tLoadout.map(mapBackendWeapon).map(attachUniqueId),
          );
        }
        if (loadoutData.ctLoadout) {
          setCtLoadout(
            loadoutData.ctLoadout.map(mapBackendWeapon).map(attachUniqueId),
          );
        }
      } catch (initError: unknown) {
        if (isMounted) {
          showError("Failed to connect to the tactical armory database.");
          console.error(initError);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    setActiveWeapon(event.active.data.current as Weapon);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      setActiveWeapon(null);
      const { active, over } = event;
      if (!over) return;

      const weapon = active.data.current as Weapon;
      const targetZone = over.id as string;
      const targetSide = over.data.current?.side as "T" | "CT";

      if (weapon.side !== "ALL" && weapon.side !== targetSide) {
        showError(`Cannot add ${weapon.side} weapon to ${targetSide} loadout!`);
        return;
      }

      const currentLoadout = targetSide === "T" ? tLoadout : ctLoadout;
      const incomingBaseName = getBaseWeaponName(weapon.name);

      const hasDuplicateBase = currentLoadout.some(
        (item) => getBaseWeaponName(item.name) === incomingBaseName,
      );
      if (hasDuplicateBase) {
        showError(
          `You already have a variant of ${incomingBaseName} equipped!`,
        );
        return;
      }

      const weaponCount = currentLoadout.filter(
        (item) => item.type === "WEAPON",
      ).length;
      const utilityCount = currentLoadout.filter(
        (item) => item.type === "UTILITY",
      ).length;

      if (weapon.type === "WEAPON" && weaponCount >= 3) {
        showError("Maximum 3 weapons allowed per loadout!");
        return;
      }
      if (weapon.type === "UTILITY" && utilityCount >= 2) {
        showError("Maximum 2 utility items allowed per loadout!");
        return;
      }

      const newItem = attachUniqueId(weapon);

      if (targetZone === "t-loadout") {
        setTLoadout((previous) => [...previous, newItem]);
      } else if (targetZone === "ct-loadout") {
        setCtLoadout((previous) => [...previous, newItem]);
      }
    },
    [tLoadout, ctLoadout, showError],
  );

  const handleRemoveItem = useCallback((uniqueId: string): void => {
    setTLoadout((previous) =>
      previous.filter((item) => item.uniqueId !== uniqueId),
    );
    setCtLoadout((previous) =>
      previous.filter((item) => item.uniqueId !== uniqueId),
    );
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    setSaveStatus("saving");
    try {
      await api.saveLoadouts(tLoadout, ctLoadout);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (saveError: unknown) {
      showError("Failed to save loadouts.");
      console.error(saveError);
      setSaveStatus("idle");
    }
  }, [tLoadout, ctLoadout, showError]);

  return {
    armoryWeapons,
    tLoadout,
    ctLoadout,
    activeWeapon,
    loading,
    saveStatus,
    error,
    handleDragStart,
    handleDragEnd,
    handleRemoveItem,
    handleSave,
  };
}
