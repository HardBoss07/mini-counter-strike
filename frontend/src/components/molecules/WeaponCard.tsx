import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import StatBadge from '../atoms/StatBadge';
import { Crosshair, Zap, Weight, ImageOff } from 'lucide-react';

export interface Weapon {
  id: number;
  name: string;
  type: 'WEAPON' | 'UTILITY';
  side: 'T' | 'CT' | 'ALL';
  energyCost: number;
  damage: number;
  drawWeight: number;
  critChance: number;
  critMultiplier: number;
  statusEffect: string;
  imageUrl: string;
  description: string;
}

interface WeaponCardProps {
  weapon: Weapon;
  isDraggable?: boolean;
}

const WeaponCard: React.FC<WeaponCardProps> = ({ weapon, isDraggable = true }) => {
  const [imageError, setImageError] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `weapon-${weapon.id}`,
    data: weapon,
    disabled: !isDraggable,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const sideColor = weapon.side === 'T' ? 'border-tactical-t' : weapon.side === 'CT' ? 'border-tactical-ct' : 'border-tactical-accent';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative w-48 h-64 bg-tactical-gray rounded-lg border-2 ${sideColor} shadow-xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing transition-transform hover:scale-105 z-10 ${isDragging ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-tactical-dark/80 px-2 py-1 rounded text-[10px] font-bold border border-white/10">
          {weapon.side}
        </div>
      </div>

      <div className="h-32 w-full bg-tactical-dark flex items-center justify-center p-4">
        {!imageError ? (
          <img 
            src={weapon.imageUrl} 
            alt={weapon.name}
            className="max-h-full max-w-full object-contain drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-600 gap-2">
            <ImageOff size={32} />
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">{weapon.name}</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between bg-gradient-to-b from-tactical-gray to-tactical-dark">
        <h3 className="text-sm font-bold truncate text-white uppercase tracking-wider">{weapon.name}</h3>
        
        <div className="grid grid-cols-3 gap-1">
          <StatBadge label="Cost" value={weapon.energyCost} icon={<Zap size={10} className="text-yellow-500" />} />
          <StatBadge label="Dmg" value={weapon.damage} icon={<Crosshair size={10} className="text-red-500" />} />
          <StatBadge label="Wt" value={weapon.drawWeight} icon={<Weight size={10} className="text-blue-500" />} />
        </div>

        <div className="mt-2 text-[9px] text-gray-400 italic line-clamp-2">
          {weapon.description}
        </div>
      </div>
    </div>
  );
};

export default WeaponCard;
