import React from "react";
import {
  DndContext,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Armory from "../components/organisms/Armory";
import LoadoutZone from "../components/organisms/LoadoutZone";
import WeaponCard from "../components/molecules/WeaponCard";
import CardSorter from "../components/organisms/CardSorter";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import ErrorToast from "../components/atoms/ErrorToast";
import { useLoadoutBuilder } from "../hooks/useLoadoutBuilder";
import { Info } from "lucide-react";

const LoadoutBuilderView: React.FC = () => {
  const {
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
  } = useLoadoutBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

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

      {error && <ErrorToast message={error} fixed />}

      {loading ? (
        <LoadingSpinner label="Synchronizing Armory..." />
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
          className="bg-tactical-accent text-black font-black px-12 py-4 rounded uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(125,1,227,0.2)] disabled:opacity-50 hover:bg-tactical-accent/80"
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
