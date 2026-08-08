import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import StatBadge from '../atoms/StatBadge';
import { Crosshair, Zap, Weight, ImageOff } from 'lucide-react';
import { useWeaponData } from '../../hooks/useWeaponData';
import type { Weapon, WeaponRarity } from '../../types/weapon';

// Re-export Weapon so existing consumers that import it from this file keep working
// without a breaking migration step. Prefer importing from src/types/weapon.ts directly.
export type { Weapon } from '../../types/weapon';
export { mapBackendWeapon } from '../../types/weapon';

interface WeaponCardProps {
  weapon?: Weapon;
  weaponId?: number;
  isDraggable?: boolean;
  onRemove?: () => void;
  isDisabled?: boolean;
  isFlippable?: boolean;
  backContent?: React.ReactNode;
  currentEnergy?: number;
}

/** Maps weapon rarity to Tailwind utility strings. */
const RARITY_COLOR_MAP: Record<WeaponRarity, string> = {
  BASE_GRADE: 'bg-rarity-base text-rarity-base border-rarity-base',
  CONSUMER_GRADE: 'bg-rarity-consumer text-rarity-consumer border-rarity-consumer',
  INDUSTRIAL_GRADE: 'bg-rarity-industrial text-rarity-industrial border-rarity-industrial',
  MIL_SPEC: 'bg-rarity-milspec text-rarity-milspec border-rarity-milspec',
  RESTRICTED: 'bg-rarity-restricted text-rarity-restricted border-rarity-restricted',
  CLASSIFIED: 'bg-rarity-classified text-rarity-classified border-rarity-classified',
  COVERT: 'bg-rarity-covert text-rarity-covert border-rarity-covert',
  CONTRABAND: 'bg-rarity-contraband text-rarity-contraband border-rarity-contraband',
};

/**
 * Inline drop-shadow values are kept as arbitrary Tailwind classes because
 * the custom rarity colors are not natively supported by Tailwind's shadow system.
 */
const RARITY_GLOW_MAP: Record<WeaponRarity, string> = {
  BASE_GRADE: 'drop-shadow-[0_0_12px_rgba(94,87,79,0.2)]',
  CONSUMER_GRADE: 'drop-shadow-[0_0_12px_rgba(176,195,217,0.2)]',
  INDUSTRIAL_GRADE: 'drop-shadow-[0_0_12px_rgba(94,152,217,0.3)]',
  MIL_SPEC: 'drop-shadow-[0_0_12px_rgba(75,105,255,0.4)]',
  RESTRICTED: 'drop-shadow-[0_0_12px_rgba(136,71,255,0.4)]',
  CLASSIFIED: 'drop-shadow-[0_0_14px_rgba(211,44,230,0.45)]',
  COVERT: 'drop-shadow-[0_0_16px_rgba(235,75,75,0.5)]',
  CONTRABAND: 'drop-shadow-[0_0_16px_rgba(228,174,57,0.5)]',
};

export const WeaponCard: React.FC<WeaponCardProps> = ({
  weapon: initialWeapon,
  weaponId,
  isDraggable = true,
  onRemove,
  isDisabled = false,
  isFlippable = false,
  backContent,
  currentEnergy,
}) => {
  const fetchedWeapon = useWeaponData(weaponId);
  const weapon = initialWeapon ?? fetchedWeapon;
  const [imageError, setImageError] = useState(false);

  if (!weapon) {
    return (
      <div className="h-64 w-48 animate-pulse rounded-lg border-2 border-white/5 bg-tactical-gray" />
    );
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: weapon.uniqueId ?? weapon.id.toString(),
    data: weapon,
    disabled: !isDraggable || isDisabled,
  });

  const sideColor =
    weapon.side === 'T'
      ? 'border-tactical-t'
      : weapon.side === 'CT'
        ? 'border-tactical-ct'
        : 'border-tactical-accent';

  const cannotAfford = currentEnergy !== undefined && weapon.energyCost > currentEnergy;

  const rarityClasses = RARITY_COLOR_MAP[weapon.rarity] ?? RARITY_COLOR_MAP.BASE_GRADE;
  const glowClass = RARITY_GLOW_MAP[weapon.rarity] ?? RARITY_GLOW_MAP.BASE_GRADE;

  const rarityParts = rarityClasses.split(' ');
  const rarityBg = rarityParts[0];
  const rarityText = rarityParts[1];

  const cardContent = (
    <div
      ref={setNodeRef}
      style={
        transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
      }
      {...listeners}
      {...attributes}
      className={[
        'relative h-64 w-48 rounded-lg border-2 bg-tactical-gray',
        sideColor,
        'flex flex-col overflow-hidden shadow-xl',
        isDraggable && !isDisabled ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'opacity-50' : '',
        isDisabled ? 'opacity-30 grayscale' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {cannotAfford && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/60 backdrop-blur-[1px]">
          <Zap size={20} className="text-yellow-500/80" />
          <span className="px-2 text-center text-[10px] font-black uppercase tracking-wider text-yellow-400/90">
            Not enough energy
          </span>
          <span className="font-mono text-[10px] text-yellow-500/70">
            {currentEnergy} / {weapon.energyCost}
          </span>
        </div>
      )}

      <div className="absolute right-2 top-2 z-20 flex gap-2">
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-sm font-bold text-white hover:bg-red-500"
          >
            X
          </button>
        )}
        <div className="rounded border border-white/10 bg-tactical-dark/80 px-2 py-1 text-[10px] font-bold">
          {weapon.side}
        </div>
      </div>

      <div className="relative flex h-32 w-full items-center justify-center bg-tactical-dark p-4">
        {!imageError ? (
          <img
            src={weapon.imageUrl}
            alt={weapon.name}
            className={`max-h-full max-w-full object-contain transition-all duration-300 ${glowClass}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageOff size={32} className="text-gray-600" />
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${rarityBg}`} />
      </div>

      <div className="flex flex-1 flex-col justify-between bg-gradient-to-b from-tactical-gray to-tactical-dark p-3">
        <div>
          <span className={`text-[8px] font-bold uppercase tracking-wider ${rarityText}`}>
            {weapon.rarity.replace('_', ' ')}
          </span>
          <h3 className="mt-0.5 truncate text-sm font-bold uppercase tracking-wide text-white">
            {weapon.name}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <StatBadge
            label="Cost"
            value={weapon.energyCost}
            icon={<Zap size={10} className="text-yellow-500" />}
            variant="energy"
          />
          <StatBadge
            label="Dmg"
            value={weapon.damage}
            icon={<Crosshair size={10} className="text-red-500" />}
          />
          <StatBadge
            label="Wt"
            value={weapon.drawWeight}
            icon={<Weight size={10} className="text-blue-500" />}
          />
        </div>
      </div>
    </div>
  );

  if (!isFlippable) return cardContent;

  return (
    <div className="group h-64 w-48 [perspective:1000px]">
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 [backface-visibility:hidden]">{cardContent}</div>
        <div
          className={`absolute inset-0 h-full w-full rounded-lg border-2 bg-tactical-gray ${sideColor} flex flex-col items-center justify-center p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default WeaponCard;
