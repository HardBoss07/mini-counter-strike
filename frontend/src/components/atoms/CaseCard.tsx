import React from "react";
import type { UserCaseInstance } from "../../types/case";

interface CaseCardProps {
  caseInstance: UserCaseInstance;
  onSelect: (instanceId: number) => void;
  disabled: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  caseInstance,
  onSelect,
  disabled,
}) => {
  return (
    <div className="flex flex-col items-center bg-tactical-gray border border-white/10 rounded-xl p-5 shadow-xl w-56 transition-all hover:scale-105 hover:border-tactical-accent/40">
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-600/20 to-yellow-700/30 border border-amber-500/20 rounded-lg flex items-center justify-center shadow-inner relative overflow-hidden mb-4 select-none">
        <span className="text-5xl drop-shadow-md">CASE PLACEHOLDER</span>
      </div>

      <h3 className="text-sm font-black tracking-wide text-white uppercase text-center truncate w-full mb-1">
        {caseInstance.caseTemplate.title}
      </h3>

      <button
        onClick={() => onSelect(caseInstance.id)}
        disabled={disabled}
        className="w-full mt-4 bg-tactical-accent disabled:opacity-20 text-black font-black py-2 rounded uppercase tracking-wider text-xs transition-colors hover:bg-tactical-accent/80 cursor-pointer"
      >
        Open Case
      </button>
    </div>
  );
};

export default CaseCard;
