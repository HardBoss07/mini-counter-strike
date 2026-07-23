import React from "react";
import { MAX_ENERGY_STORAGE, MAX_ENERGY_PER_TURN } from "../../utils/constants";

interface EnergyBarProps {
  /** The player's current energy total. */
  current: number;
  /** Optional override for the maximum segments to render. Defaults to MAX_ENERGY_STORAGE. */
  max?: number;
}

/**
 * Segmented energy bar with 10 slots (MAX_ENERGY_STORAGE).
 *
 * - Filled segments glow yellow.
 * - Segments 1-6 (the per-turn replenishment ceiling) have a brighter glow
 *   to distinguish the "earnable per turn" range from overflow carry-over.
 * - A subtle divider line is drawn after the 6th segment to mark that boundary.
 */
const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max = MAX_ENERGY_STORAGE,
}) => {
  const clamped = Math.max(0, Math.min(current, max));

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">
          Energy
        </span>
        <span className="text-[10px] font-mono text-yellow-400">
          {clamped}/{max}
        </span>
      </div>
      <div className="flex gap-[3px] items-center">
        {Array.from({ length: max }, (_, index) => {
          const segmentNumber = index + 1;
          const isFilled = segmentNumber <= clamped;
          const isWithinPerTurnCap = segmentNumber <= MAX_ENERGY_PER_TURN;
          const isDivider = segmentNumber === MAX_ENERGY_PER_TURN;

          return (
            <React.Fragment key={segmentNumber}>
              <div
                className={[
                  "h-2 flex-1 rounded-sm transition-all duration-300",
                  isFilled
                    ? isWithinPerTurnCap
                      ? "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]"
                      : "bg-yellow-600 shadow-[0_0_4px_rgba(202,138,4,0.5)]"
                    : "bg-white/5 border border-white/10",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {isDivider && (
                <div className="w-[2px] h-3 rounded-full bg-yellow-500/30 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default EnergyBar;
