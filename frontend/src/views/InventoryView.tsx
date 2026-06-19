import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import WeaponCard, { mapBackendWeapon } from '../components/molecules/WeaponCard';
import type { Weapon } from '../components/molecules/WeaponCard';
import { Loader2 } from 'lucide-react';

const InventoryView: React.FC = () => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWeapons()
      .then(data => setWeapons(data.map(mapBackendWeapon)))
      .catch(err => {
        console.error('API Error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="animate-spin text-tactical-accent mx-auto" size={48} />;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-6">
      {weapons.map(weapon => (
        <div key={weapon.id} className="group cursor-pointer">
          <div className="group-hover:[transform:rotateY(180deg)] transition-all duration-500 [transform-style:preserve-3d]">
            <div className="[backface-visibility:hidden]">
              <WeaponCard weapon={weapon} isDraggable={false} />
            </div>
            <div className="absolute inset-0 bg-tactical-gray border border-tactical-accent rounded-lg p-4 flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <h3 className="text-white font-bold mb-2">{weapon.name}</h3>
              <p className="text-xs text-gray-400">{weapon.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryView;
