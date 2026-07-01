import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import StatBadge from "../atoms/StatBadge";
import { Crosshair, Zap, Weight, ImageOff } from "lucide-react";
import { useWeaponData } from "../../hooks/useWeaponData";
import type { Weapon, WeaponRarity } from "../../types/weapon";

// Re-export Weapon so existing consumers that import it from this file keep working
// without a breaking migration step. Prefer importing from src/types/weapon.ts directly.
export type { Weapon } from "../../types/weapon";
export { mapBackendWeapon } from "../../types/weapon";

interface WeaponCardProps {
  weapon?: Weapon;
  weaponId?: number;
  isDraggable?: boolean;
  onRemove?: () => void;
  isDisabled?: boolean;
  isFlippable?: boolean;
  backContent?: React.ReactNode;
}

/** Maps weapon rarity to Tailwind utility strings. */
const RARITY_COLOR_MAP: Record<WeaponRarity, string> = {
  BASE_GRADE: "bg-rarity-base text-rarity-base border-rarity-base",
  CONSUMER_GRADE:
    "bg-rarity-consumer text-rarity-consumer border-rarity-consumer",
  INDUSTRIAL_GRADE:
    "bg-rarity-industrial text-rarity-industrial border-rarity-industrial",
  MIL_SPEC: "bg-rarity-milspec text-rarity-milspec border-rarity-milspec",
  RESTRICTED:
    "bg-rarity-restricted text-rarity-restricted border-rarity-restricted",
  CLASSIFIED:
    "bg-rarity-classified text-rarity-classified border-rarity-classified",
  COVERT: "bg-rarity-covert text-rarity-covert border-rarity-covert",
  CONTRABAND:
    "bg-rarity-contraband text-rarity-contraband border-rarity-contraband",
};

/**
 * Inline drop-shadow values are kept as arbitrary Tailwind classes because
 * the custom rarity colors are not natively supported by Tailwind's shadow system.
 */
const RARITY_GLOW_MAP: Record<WeaponRarity, string> = {
  BASE_GRADE: "drop-shadow-[0_0_12px_rgba(94,87,79,0.2)]",
  CONSUMER_GRADE: "drop-shadow-[0_0_12px_rgba(176,195,217,0.2)]",
  INDUSTRIAL_GRADE: "drop-shadow-[0_0_12px_rgba(94,152,217,0.3)]",
  MIL_SPEC: "drop-shadow-[0_0_12px_rgba(75,105,255,0.4)]",
  RESTRICTED: "drop-shadow-[0_0_12px_rgba(136,71,255,0.4)]",
  CLASSIFIED: "drop-shadow-[0_0_14px_rgba(211,44,230,0.45)]",
  COVERT: "drop-shadow-[0_0_16px_rgba(235,75,75,0.5)]",
  CONTRABAND: "drop-shadow-[0_0_16px_rgba(228,174,57,0.5)]",
};

export const WeaponCard: React.FC<WeaponCardProps> = ({
  weapon: initialWeapon,
  weaponId,
  isDraggable = true,
  onRemove,
  isDisabled = false,
  isFlippable = false,
  backContent,
}) => {
  const fetchedWeapon = useWeaponData(weaponId);
  const weapon = initialWeapon ?? fetchedWeapon;
  const [imageError, setImageError] = useState(false);

  if (!weapon) {
    return (
      <div className="w-48 h-64 bg-tactical-gray rounded-lg border-2 border-white/5 animate-pulse" />
    );
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: weapon.uniqueId ?? weapon.id.toString(),
      data: weapon,
      disabled: !isDraggable || isDisabled,
    });

  const sideColor =
    weapon.side === "T"
      ? "border-tactical-t"
      : weapon.side === "CT"
        ? "border-tactical-ct"
        : "border-tactical-accent";

  const rarityClasses =
    RARITY_COLOR_MAP[weapon.rarity] ?? RARITY_COLOR_MAP.BASE_GRADE;
  const glowClass =
    RARITY_GLOW_MAP[weapon.rarity] ?? RARITY_GLOW_MAP.BASE_GRADE;

  const rarityParts = rarityClasses.split(" ");
  const rarityBg = rarityParts[0];
  const rarityText = rarityParts[1];

  const cardContent = (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      {...listeners}
      {...attributes}
      className={[
        "relative w-48 h-64 bg-tactical-gray rounded-lg border-2",
        sideColor,
        "shadow-xl overflow-hidden flex flex-col",
        isDraggable && !isDisabled ? "cursor-grab active:cursor-grabbing" : "",
        isDragging ? "opacity-50" : "",
        isDisabled ? "opacity-30 grayscale" : "",
      ]
        .filter(Boolean)
        .join(" ")}
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

      <div className="relative h-32 w-full bg-tactical-dark flex items-center justify-center p-4">
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

      <div className="flex-1 p-3 flex flex-col justify-between bg-gradient-to-b from-tactical-gray to-tactical-dark">
        <div>
          <span
            className={`text-[8px] font-bold uppercase tracking-wider ${rarityText}`}
          >
            {weapon.rarity.replace("_", " ")}
          </span>
          <h3 className="text-sm font-bold truncate text-white uppercase tracking-wide mt-0.5">
            {weapon.name}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <StatBadge
            label="Cost"
            value={weapon.energyCost}
            icon={<Zap size={10} className="text-yellow-500" />}
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
    <div className="w-48 h-64 [perspective:1000px] group">
      <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {cardContent}
        </div>
        <div
          className={`absolute inset-0 w-full h-full bg-tactical-gray rounded-lg border-2 ${sideColor} p-4 flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]`}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default WeaponCard;
