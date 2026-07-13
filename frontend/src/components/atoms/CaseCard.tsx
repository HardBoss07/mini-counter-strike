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
        <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-black tracking-widest bg-amber-500 text-black rounded uppercase">
          Container
        </div>
        <span className="text-5xl drop-shadow-md">CASE PLACEHOLDER</span>
      </div>

      <h3 className="text-sm font-black tracking-wide text-white uppercase text-center truncate w-full mb-1">
        {caseInstance.caseTemplate.title}
      </h3>
      <p className="text-[10px] text-zinc-500 font-mono mb-4">
        INSTANCE #{caseInstance.id}
      </p>

      <button
        onClick={() => onSelect(caseInstance.id)}
        disabled={disabled}
        className="w-full bg-tactical-accent disabled:opacity-20 text-black font-black py-2 rounded uppercase tracking-wider text-xs transition-colors hover:bg-tactical-accent/80 cursor-pointer"
      >
        Select Container
      </button>
    </div>
  );
};

export default CaseCard;
