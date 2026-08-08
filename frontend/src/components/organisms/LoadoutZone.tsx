import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import WeaponCard from '../molecules/WeaponCard';
import type { LoadoutItem } from '../../types/loadout';

interface LoadoutZoneProps {
  id: string;
  title: string;
  side: 'T' | 'CT';
  items: LoadoutItem[];
  onRemoveItem: (uniqueId: string) => void;
}

const LoadoutZone: React.FC<LoadoutZoneProps> = ({ id, title, side, items, onRemoveItem }) => {
  const { isOver, setNodeRef } = useDroppable({ id, data: { side } });

  const weaponCount = items.filter((item) => item.type === 'WEAPON').length;
  const utilityCount = items.filter((item) => item.type === 'UTILITY').length;

  const borderColor = side === 'T' ? 'border-tactical-t/30' : 'border-tactical-ct/30';
  const overColor = side === 'T' ? 'bg-tactical-t/10' : 'bg-tactical-ct/10';
  const titleColor = side === 'T' ? 'text-tactical-t' : 'text-tactical-ct';

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] rounded-xl border-2 border-dashed p-6 ${borderColor} transition-colors ${isOver ? overColor : 'bg-black/20'}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-black uppercase tracking-wider ${titleColor}`}>{title}</h2>
        <div className="flex gap-4 text-[10px] font-bold">
          <span className={weaponCount > 3 ? 'text-red-500' : 'text-gray-400'}>
            WEAPONS: {weaponCount}/3
          </span>
          <span className={utilityCount > 2 ? 'text-red-500' : 'text-gray-400'}>
            UTILITY: {utilityCount}/2
          </span>
        </div>
      </div>

      <div className="flex min-h-[100px] flex-wrap gap-4">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-white/5 text-sm italic text-gray-600">
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
