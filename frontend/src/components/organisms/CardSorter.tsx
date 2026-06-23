import React, { useState, useMemo } from "react";
import type { Weapon } from "../molecules/WeaponCard";
import { ChevronDown, Search } from "lucide-react";

interface CardSorterProps {
  items: Weapon[];
  children: (filteredItems: Weapon[]) => React.ReactNode;
}

type SortOption =
  | "name"
  | "cost-asc"
  | "cost-desc"
  | "dmg-desc"
  | "rarity-desc"
  | "rarity-asc";
type SideFilter = "ALL" | "T" | "CT";

const RARITY_WEIGHT: Record<Weapon["rarity"], number> = {
  BASE_GRADE: 0,
  CONSUMER_GRADE: 1,
  INDUSTRIAL_GRADE: 2,
  MIL_SPEC: 3,
  RESTRICTED: 4,
  CLASSIFIED: 5,
  COVERT: 6,
  CONTRABAND: 7,
};

export const CardSorter: React.FC<CardSorterProps> = ({ items, children }) => {
  const [search, setSearch] = useState("");
  const [side, setSide] = useState<SideFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const processedItems = useMemo(() => {
    let result = [...items];

    if (side !== "ALL") {
      result = result.filter((w) => w.side === side || w.side === "ALL");
    }

    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter((w) => w.name.toLowerCase().includes(query));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "cost-asc":
          return a.energyCost - b.energyCost;
        case "cost-desc":
          return b.energyCost - a.energyCost;
        case "dmg-desc":
          return b.damage - a.damage;
        case "rarity-desc":
          return RARITY_WEIGHT[b.rarity] - RARITY_WEIGHT[a.rarity];
        case "rarity-asc":
          return RARITY_WEIGHT[a.rarity] - RARITY_WEIGHT[b.rarity];
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [items, search, side, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-tactical-dark/40 p-4 rounded-lg border border-white/5 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex items-center">
            <Search
              size={16}
              className="absolute left-3 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search weapons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-tactical-dark border border-white/10 rounded pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tactical-accent min-w-[200px]"
            />
          </div>

          <div className="relative flex items-center">
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as SideFilter)}
              className="appearance-none bg-tactical-dark border border-white/10 rounded pl-3 pr-8 py-1.5 text-sm text-white focus:outline-none focus:border-tactical-accent cursor-pointer min-w-[110px]"
            >
              <option value="ALL">All Sides</option>
              <option value="T">T-Side</option>
              <option value="CT">CT-Side</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="relative flex items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-tactical-dark border border-white/10 rounded pl-3 pr-8 py-1.5 text-sm text-white focus:outline-none focus:border-tactical-accent cursor-pointer min-w-[150px]"
          >
            <option value="name">Alphabetical</option>
            <option value="rarity-desc">Rarity: High to Low</option>
            <option value="rarity-asc">Rarity: Low to High</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="dmg-desc">Damage: High to Low</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {processedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-sm">
          No weapons match your filters.
        </div>
      ) : (
        children(processedItems)
      )}
    </div>
  );
};

export default CardSorter;
