import React from 'react';
import WeaponCard from '../molecules/WeaponCard';
import type { Weapon } from '../../types/weapon';

interface ArmoryProps {
  weapons: Weapon[];
  tLoadout: Weapon[];
  ctLoadout: Weapon[];
}

const Armory: React.FC<ArmoryProps> = ({ weapons, tLoadout, ctLoadout }) => {
  return (
    <div className="rounded-xl border border-white/5 bg-tactical-gray/30 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-widest text-tactical-accent">
          The Armory
        </h2>
        <span className="font-mono text-xs text-gray-500">{weapons.length} ITEMS AVAILABLE</span>
      </div>

      <div className="custom-scrollbar grid max-h-[600px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 overflow-y-auto pr-2">
        {weapons.map((weapon) => {
          const isEquipped =
            tLoadout.some((equipped) => equipped.id === weapon.id) ||
            ctLoadout.some((equipped) => equipped.id === weapon.id);
          return <WeaponCard key={weapon.id} weapon={weapon} isDisabled={isEquipped} />;
        })}
      </div>
    </div>
  );
};

export default Armory;
