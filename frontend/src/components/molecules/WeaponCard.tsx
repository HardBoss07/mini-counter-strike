import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import StatBadge from "../atoms/StatBadge";
import { Crosshair, Zap, Weight, ImageOff } from "lucide-react";
import { useWeaponData } from "../../hooks/useWeaponData";

export interface Weapon {
  id: number;
  uniqueId?: string;
  name: string;
  type: "WEAPON" | "UTILITY";
  side: "T" | "CT" | "ALL";
  energyCost: number;
  damage: number;
  drawWeight: number;
  critChance: number;
  critMultiplier: number;
  statusEffect: string;
  rarity:
    | "BASE_GRADE"
    | "CONSUMER_GRADE"
    | "INDUSTRIAL_GRADE"
    | "MIL_SPEC"
    | "RESTRICTED"
    | "CLASSIFIED"
    | "COVERT"
    | "CONTRABAND";
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
    name: template.name || "Unknown Weapon",
    type: template.type || "WEAPON",
    side: template.side || "ALL",
    energyCost: getField("energyCost", "energy_cost", 0),
    damage: template.damage || 0,
    drawWeight: getField("drawWeight", "draw_weight", 0),
    critChance: getField("critChance", "crit_chance", 0),
    critMultiplier: getField("critMultiplier", "crit_multiplier", 1.0),
    statusEffect: getField("statusEffect", "status_effect", "NONE"),
    rarity: getField("rarity", "rarity", "BASE_GRADE"),
    imageUrl: getField(
      "imageUrl",
      "image_url",
      "/assets/placeholder-weapon.png",
    ),
    description: template.description || "No description available",
  };
};

interface WeaponCardProps {
  weapon?: Weapon;
  weaponId?: number;
  isDraggable?: boolean;
  onRemove?: () => void;
  isDisabled?: boolean;
  isFlippable?: boolean;
  backContent?: React.ReactNode;
}

// Maps your Weapon rarity strings directly to your custom Tailwind config utility keys
const RARITY_COLOR_MAP: Record<Weapon["rarity"], string> = {
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

// Maps inline drop-shadow filters dynamically since Tailwind standard class builds don't support custom arbitrary values cleanly
const RARITY_GLOW_MAP: Record<Weapon["rarity"], string> = {
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
  const weapon = initialWeapon || fetchedWeapon;
  const [imageError, setImageError] = useState(false);

  if (!weapon)
    return (
      <div className="w-48 h-64 bg-tactical-gray rounded-lg border-2 border-white/5 animate-pulse" />
    );

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: weapon.uniqueId || weapon.id.toString(),
      data: weapon,
      disabled: !isDraggable || isDisabled,
    });

  const sideColor =
    weapon.side === "T"
      ? "border-tactical-t"
      : weapon.side === "CT"
        ? "border-tactical-ct"
        : "border-tactical-accent";

  // Safeguard utility lookup mapping to protect rendering states
  const rarityClasses =
    RARITY_COLOR_MAP[weapon.rarity] || RARITY_COLOR_MAP.BASE_GRADE;
  const glowClass =
    RARITY_GLOW_MAP[weapon.rarity] || RARITY_GLOW_MAP.BASE_GRADE;

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
      className={`relative w-48 h-64 bg-tactical-gray rounded-lg border-2 ${sideColor} shadow-xl overflow-hidden flex flex-col ${isDraggable && !isDisabled ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "opacity-50" : ""} ${isDisabled ? "opacity-30 grayscale" : ""}`}
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

      {/* Weapon Image Wrapper Box */}
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

        {/* Visual Element 1: Dynamic rarity stripe accent alignment pinning item category tiers */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${rarityClasses.split(" ")[0]}`}
        />
      </div>

      {/* Item text metadata panel area details layout mapping */}
      <div className="flex-1 p-3 flex flex-col justify-between bg-gradient-to-b from-tactical-gray to-tactical-dark">
        <div>
          {/* Visual Element 2: Small micro rarity tier indicator layout name */}
          <span
            className={`text-[8px] font-bold uppercase tracking-wider ${rarityClasses.split(" ")[1]}`}
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
        {/* Matches the front face's external framework precisely mapping container details */}
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
