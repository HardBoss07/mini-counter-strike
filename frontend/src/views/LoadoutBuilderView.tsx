import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import Armory from "../components/organisms/Armory";
import LoadoutZone from "../components/organisms/LoadoutZone";
import WeaponCard from "../components/molecules/WeaponCard";
import { mapBackendWeapon } from "../components/molecules/WeaponCard";
import type { Weapon } from "../components/molecules/WeaponCard";
import CardSorter from "../components/organisms/CardSorter";
import { ShieldAlert, Info, Loader2 } from "lucide-react";
import { api } from "../utils/api";

type LoadoutItem = Weapon & { uniqueId: string };

const LoadoutBuilderView: React.FC = () => {
  const [armoryWeapons, setArmoryWeapons] = useState<Weapon[]>([]);
  const [tLoadout, setTLoadout] = useState<LoadoutItem[]>([]);
  const [ctLoadout, setCtLoadout] = useState<LoadoutItem[]>([]);
  const [activeWeapon, setActiveWeapon] = useState<Weapon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const initializeBuilder = async () => {
      try {
        setLoading(true);

        const [weaponsData, loadoutData] = await Promise.all([
          api.getWeapons(),
          api.getLoadouts(),
        ]);

        setArmoryWeapons(weaponsData.map(mapBackendWeapon));

        if (loadoutData.tLoadout) {
          setTLoadout(
            loadoutData.tLoadout.map((w) => ({
              ...mapBackendWeapon(w),
              uniqueId: `${w.id}-${crypto.randomUUID()}`,
            })),
          );
        }

        if (loadoutData.ctLoadout) {
          setCtLoadout(
            loadoutData.ctLoadout.map((w) => ({
              ...mapBackendWeapon(w),
              uniqueId: `${w.id}-${crypto.randomUUID()}`,
            })),
          );
        }
      } catch (err) {
        showError("Failed to connect to the tactical armory database.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeBuilder();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveWeapon(event.active.data.current as Weapon);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

    const getBaseWeaponName = (fullName: string) => fullName.split(" | ")[0];
    const incomingBaseName = getBaseWeaponName(weapon.name);

    const holdsBaseDuplicate = currentLoadout.some(
      (item) => getBaseWeaponName(item.name) === incomingBaseName,
    );

    if (holdsBaseDuplicate) {
      showError(
        `You already have a variant of ${incomingBaseName} equipped in this loadout!`,
      );
      return;
    }

    const weaponCount = currentLoadout.filter(
      (i) => i.type === "WEAPON",
    ).length;
    const utilityCount = currentLoadout.filter(
      (i) => i.type === "UTILITY",
    ).length;

    if (weapon.type === "WEAPON" && weaponCount >= 3) {
      showError("Maximum 3 Weapons allowed per loadout!");
      return;
    }
    if (weapon.type === "UTILITY" && utilityCount >= 2) {
      showError("Maximum 2 Utility items allowed per loadout!");
      return;
    }

    const newItem: LoadoutItem = {
      ...weapon,
      uniqueId: `${weapon.id}-${crypto.randomUUID()}`,
    };

    if (targetZone === "t-loadout") {
      setTLoadout((prev) => [...prev, newItem]);
    } else if (targetZone === "ct-loadout") {
      setCtLoadout((prev) => [...prev, newItem]);
    }
  };

  const handleRemoveItem = (uniqueId: string) => {
    setTLoadout((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    setCtLoadout((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await api.saveLoadouts(tLoadout, ctLoadout);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      showError("Failed to save loadouts.");
      setSaveStatus("idle");
    }
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-tactical-dark p-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
          Loadout <span className="text-tactical-accent">Builder</span>
        </h1>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Info size={16} />
          <p>Drag weapons from the armory into your T or CT loadout zones.</p>
        </div>
      </header>

      {error && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-3 z-50">
          <ShieldAlert size={20} />
          <span className="font-bold text-sm uppercase">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-tactical-accent">
          <Loader2 size={48} className="animate-spin" />
          <span className="font-bold uppercase tracking-widest">
            Synchronizing Armory...
          </span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <LoadoutZone
              id="t-loadout"
              title="T-Side Loadout"
              side="T"
              items={tLoadout}
              onRemoveItem={handleRemoveItem}
            />
            <LoadoutZone
              id="ct-loadout"
              title="CT-Side Loadout"
              side="CT"
              items={ctLoadout}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <CardSorter items={armoryWeapons}>
            {(filteredWeapons) => (
              <Armory
                weapons={filteredWeapons}
                tLoadout={tLoadout}
                ctLoadout={ctLoadout}
              />
            )}
          </CardSorter>

          <DragOverlay>
            {activeWeapon ? <WeaponCard weapon={activeWeapon} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <footer className="mt-auto pt-8 border-t border-white/5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus !== "idle"}
          className="bg-tactical-accent text-black font-black px-12 py-4 rounded uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(125,1,227,0.2)] disabled:opacity-50"
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved!"
              : "Save Loadouts"}
        </button>
      </footer>
    </div>
  );
};

export default LoadoutBuilderView;
