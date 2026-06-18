import React, { useState, useEffect } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import Armory from '../components/organisms/Armory';
import LoadoutZone from '../components/organisms/LoadoutZone';
import type { Weapon } from '../components/molecules/WeaponCard';
import { ShieldAlert, Info, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

const LoadoutBuilderView: React.FC = () => {
  const [armoryWeapons, setArmoryWeapons] = useState<Weapon[]>([]);
  const [tLoadout, setTLoadout] = useState<Weapon[]>([]);
  const [ctLoadout, setCtLoadout] = useState<Weapon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        setLoading(true);
        const data = await api.getWeapons();
        setArmoryWeapons(data);
      } catch (err) {
        showError("Failed to connect to the tactical armory database.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeapons();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const weapon = active.data.current as Weapon;
    const targetZone = over.id as string;
    const targetSide = over.data.current?.side as 'T' | 'CT';

    // 1. Enforce Side Restrictions
    if (weapon.side !== 'ALL' && weapon.side !== targetSide) {
      showError(`Cannot add ${weapon.side} weapon to ${targetSide} loadout!`);
      return;
    }

    // 2. Enforce Loadout Limits (3 Weapons, 2 Utility)
    const currentLoadout = targetSide === 'T' ? tLoadout : ctLoadout;
    const weaponCount = currentLoadout.filter(i => i.type === 'WEAPON').length;
    const utilityCount = currentLoadout.filter(i => i.type === 'UTILITY').length;

    if (weapon.type === 'WEAPON' && weaponCount >= 3) {
      showError("Maximum 3 Weapons allowed per loadout!");
      return;
    }
    if (weapon.type === 'UTILITY' && utilityCount >= 2) {
      showError("Maximum 2 Utility items allowed per loadout!");
      return;
    }

    // 3. Add to loadout
    if (targetZone === 't-loadout') {
      setTLoadout(prev => [...prev, weapon]);
    } else if (targetZone === 'ct-loadout') {
      setCtLoadout(prev => [...prev, weapon]);
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
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <ShieldAlert size={20} />
          <span className="font-bold text-sm uppercase">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-tactical-accent">
          <Loader2 size={48} className="animate-spin" />
          <span className="font-bold uppercase tracking-widest animate-pulse">Synchronizing Armory...</span>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-2 gap-8">
            <LoadoutZone id="t-loadout" title="T-Side Loadout" side="T" items={tLoadout} />
            <LoadoutZone id="ct-loadout" title="CT-Side Loadout" side="CT" items={ctLoadout} />
          </div>

          <Armory weapons={armoryWeapons} />
        </DndContext>
      )}
      
      <footer className="mt-auto pt-8 border-t border-white/5 flex justify-end">
        <button className="bg-tactical-accent hover:bg-tactical-accent/80 text-black font-black px-12 py-4 rounded uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(197,160,89,0.2)]">
          Save Loadouts
        </button>
      </footer>
    </div>
  );
};

export default LoadoutBuilderView;
