import React from 'react';
import WeaponCard from '../molecules/WeaponCard';
import type { Weapon } from '../molecules/WeaponCard';

interface ArmoryProps {
  weapons: Weapon[];
  tLoadout: Weapon[];
  ctLoadout: Weapon[];
}

const Armory: React.FC<ArmoryProps> = ({ weapons, tLoadout, ctLoadout }) => {
  return (
    <div className="bg-tactical-gray/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-widest text-tactical-accent">The Armory</h2>
        <span className="text-xs text-gray-500 font-mono">{weapons.length} ITEMS AVAILABLE</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {weapons.map((weapon) => {
          const isEquipped = tLoadout.some(w => w.id === weapon.id) || ctLoadout.some(w => w.id === weapon.id);
          return (
            <WeaponCard 
              key={weapon.id} 
              weapon={weapon} 
              isDisabled={isEquipped} 
            />
          );
        })}
      </div>
    </div>
  );
};

export default Armory;
