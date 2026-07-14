import React, { useState } from "react";
import { ImageOff } from "lucide-react";
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
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center bg-tactical-gray border border-white/10 rounded-xl p-5 shadow-xl w-56 transition-all hover:scale-105 hover:border-tactical-accent/40">
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-600/20 to-yellow-700/30 border border-amber-500/20 rounded-lg flex items-center justify-center shadow-inner relative overflow-hidden mb-4 select-none">
        {!imageError ? (
          <img
            src={caseInstance.caseTemplate.imageUrl}
            alt={caseInstance.caseTemplate.title}
            className="max-h-full max-w-full object-contain transition-all duration-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageOff size={40} className="text-amber-600/50" />
        )}
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
