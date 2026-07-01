/**
 * Canonical weapon rarity tiers, ordered from lowest to highest.
 * These map 1-to-1 to the backend WeaponArchetype rarity enum.
 */
export type WeaponRarity =
  | "BASE_GRADE"
  | "CONSUMER_GRADE"
  | "INDUSTRIAL_GRADE"
  | "MIL_SPEC"
  | "RESTRICTED"
  | "CLASSIFIED"
  | "COVERT"
  | "CONTRABAND";

/** Which faction side a weapon is legal in. */
export type WeaponSide = "T" | "CT" | "ALL";

/** Whether an item is an active weapon or a utility/grenade. */
export type WeaponType = "WEAPON" | "UTILITY";

/**
 * Canonical frontend representation of a weapon or utility item.
 * All views and hooks consume this shape — never a raw backend payload.
 */
export interface Weapon {
  id: number;
  /** Stable unique ID used by DnD kit to track drag instances. */
  uniqueId?: string;
  name: string;
  type: WeaponType;
  side: WeaponSide;
  energyCost: number;
  damage: number;
  drawWeight: number;
  critChance: number;
  critMultiplier: number;
  statusEffect: string;
  rarity: WeaponRarity;
  imageUrl: string;
  description: string;
}

/**
 * Raw backend payload shape returned by /api/inventory/weapons and
 * embedded inside match state hand arrays. Both camelCase and snake_case
 * field names are handled via getField.
 */
interface RawWeaponPayload {
  id: number;
  template?: RawWeaponTemplate;
  name?: string;
  type?: string;
  side?: string;
  energyCost?: number;
  energy_cost?: number;
  damage?: number;
  drawWeight?: number;
  draw_weight?: number;
  critChance?: number;
  crit_chance?: number;
  critMultiplier?: number;
  crit_multiplier?: number;
  statusEffect?: string;
  status_effect?: string;
  rarity?: string;
  imageUrl?: string;
  image_url?: string;
  description?: string;
}

interface RawWeaponTemplate {
  name?: string;
  type?: string;
  side?: string;
  energyCost?: number;
  energy_cost?: number;
  damage?: number;
  drawWeight?: number;
  draw_weight?: number;
  critChance?: number;
  crit_chance?: number;
  critMultiplier?: number;
  crit_multiplier?: number;
  statusEffect?: string;
  status_effect?: string;
  rarity?: string;
  imageUrl?: string;
  image_url?: string;
  description?: string;
}

/**
 * Maps a raw backend weapon payload (either a WeaponTemplate or a
 * UserWeaponInstance wrapping a template) into the canonical Weapon shape.
 * Handles both camelCase and snake_case field names from the backend.
 */
export function mapBackendWeapon(raw: RawWeaponPayload): Weapon {
  const template = raw.template ?? raw;

  function getField<T>(
    camelKey: keyof RawWeaponTemplate,
    snakeKey: keyof RawWeaponTemplate,
    fallback: T,
  ): T {
    const value = template[camelKey] ?? template[snakeKey];
    return value !== undefined && value !== null ? (value as T) : fallback;
  }

  return {
    id: raw.id,
    name: template.name ?? "Unknown Weapon",
    type: (template.type ?? "WEAPON") as WeaponType,
    side: (template.side ?? "ALL") as WeaponSide,
    energyCost: getField("energyCost", "energy_cost", 0),
    damage: template.damage ?? 0,
    drawWeight: getField("drawWeight", "draw_weight", 0),
    critChance: getField("critChance", "crit_chance", 0),
    critMultiplier: getField("critMultiplier", "crit_multiplier", 1.0),
    statusEffect: getField("statusEffect", "status_effect", "NONE"),
    rarity: getField<WeaponRarity>("rarity", "rarity", "BASE_GRADE"),
    imageUrl: getField(
      "imageUrl",
      "image_url",
      "/assets/placeholder-weapon.png",
    ),
    description: template.description ?? "No description available",
  };
}
