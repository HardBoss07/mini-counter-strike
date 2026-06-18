import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import WeaponCard from '../molecules/WeaponCard';
import type { Weapon } from '../molecules/WeaponCard';

interface LoadoutZoneProps {
  id: string;
  title: string;
  side: 'T' | 'CT';
  items: (Weapon & { uniqueId: string })[]; // Assuming uniqueId is added
  onRemoveItem: (uniqueId: string) => void;
}

const LoadoutZone: React.FC<LoadoutZoneProps> = ({ id, title, side, items, onRemoveItem }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: { side },
  });

  const weaponCount = items.filter(i => i.type === 'WEAPON').length;
  const utilityCount = items.filter(i => i.type === 'UTILITY').length;

  const borderColor = side === 'T' ? 'border-tactical-t/30' : 'border-tactical-ct/30';
  const overColor = side === 'T' ? 'bg-tactical-t/10' : 'bg-tactical-ct/10';

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] p-6 rounded-xl border-2 border-dashed ${borderColor} transition-colors ${isOver ? overColor : 'bg-black/20'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-black uppercase tracking-wider ${side === 'T' ? 'text-tactical-t' : 'text-tactical-ct'}`}>
          {title}
        </h2>
        <div className="flex gap-4 text-[10px] font-bold">
          <span className={weaponCount > 3 ? 'text-red-500' : 'text-gray-400'}>WEAPONS: {weaponCount}/3</span>
          <span className={utilityCount > 2 ? 'text-red-500' : 'text-gray-400'}>UTILITY: {utilityCount}/2</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 min-h-[100px]">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 italic text-sm border border-white/5 rounded-lg">
            Drag items here to build your loadout
          </div>
        ) : (
          items.map((item) => (
            <WeaponCard 
              key={item.uniqueId} 
              weapon={item} 
              isDraggable={false} 
              onRemove={() => onRemoveItem(item.uniqueId)} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LoadoutZone;
