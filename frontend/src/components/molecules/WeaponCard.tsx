import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import StatBadge from '../atoms/StatBadge';
import { Crosshair, Zap, Weight, ImageOff } from 'lucide-react';
import { useWeaponData } from '../../hooks/useWeaponData';

export interface Weapon {
  id: number;
  uniqueId?: string;
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

export const mapBackendWeapon = (raw: any): Weapon => {
  const template = raw.template || raw; 

  const getField = (camel: string, snake: string, fallback: any = null) => {
    return template[camel] ?? template[snake] ?? fallback;
  };

  return {
    id: raw.id,
    name: template.name || 'Unknown Weapon',
    type: template.type || 'WEAPON',
    side: template.side || 'ALL',
    energyCost: getField('energyCost', 'energy_cost', 0),
    damage: template.damage || 0,
    drawWeight: getField('drawWeight', 'draw_weight', 0),
    critChance: getField('critChance', 'crit_chance', 0),
    critMultiplier: getField('critMultiplier', 'crit_multiplier', 1.0),
    statusEffect: getField('statusEffect', 'status_effect', 'NONE'),
    imageUrl: getField('imageUrl', 'image_url', '/assets/placeholder-weapon.png'),
    description: template.description || 'No description available',
  };
};

interface WeaponCardProps {
  weapon?: Weapon;
  weaponId?: number;
  isDraggable?: boolean;
  onRemove?: () => void;
  isDisabled?: boolean;
}

const WeaponCard: React.FC<WeaponCardProps> = ({ weapon: initialWeapon, weaponId, isDraggable = true, onRemove, isDisabled = false }) => {
  const fetchedWeapon = useWeaponData(weaponId);
  const weapon = initialWeapon || fetchedWeapon;
  const [imageError, setImageError] = useState(false);

  if (!weapon) {
    return <div className="w-48 h-64 bg-tactical-gray rounded-lg border-2 border-white/5 animate-pulse" />;
  }


  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: weapon.uniqueId || weapon.id.toString(),
    data: weapon,
    disabled: !isDraggable || isDisabled,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const imageUrl = weapon?.imageUrl?.startsWith('/') 
    ? `${window.location.origin}${weapon.imageUrl}` 
    : weapon?.imageUrl;

  const sideColor = weapon.side === 'T' ? 'border-tactical-t' : weapon.side === 'CT' ? 'border-tactical-ct' : 'border-tactical-accent';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative w-48 h-64 bg-tactical-gray rounded-lg border-2 ${sideColor} shadow-xl overflow-hidden flex flex-col ${isDraggable && !isDisabled ? 'cursor-grab active:cursor-grabbing' : ''} z-10 ${isDragging ? 'opacity-50' : ''} ${isDisabled ? 'opacity-30 grayscale' : ''}`}
    >
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {onRemove && (
          <button 
            onClick={onRemove}
            className="bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm hover:bg-red-500"
          >
            X
          </button>
        )}
        <div className="bg-tactical-dark/80 px-2 py-1 rounded text-[10px] font-bold border border-white/10">
          {weapon.side}
        </div>
      </div>

      <div className="h-32 w-full bg-tactical-dark flex items-center justify-center p-4">
        {!imageError ? (
          <img 
            src={imageUrl} 
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
