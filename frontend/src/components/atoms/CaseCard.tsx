import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { UserCaseInstance } from '../../types/case';

interface CaseCardProps {
  caseInstance: UserCaseInstance;
  onSelect: (instanceId: number) => void;
  disabled: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseInstance, onSelect, disabled }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex w-56 flex-col items-center rounded-xl border border-white/10 bg-tactical-gray p-5 shadow-xl transition-all hover:scale-105 hover:border-tactical-accent/40">
      <div className="relative mb-4 flex aspect-[4/3] w-full select-none items-center justify-center overflow-hidden rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-600/20 to-yellow-700/30 shadow-inner">
        {!imageError ? (
          <img
            src={caseInstance.caseTemplate.imageUrl}
            alt={caseInstance.caseTemplate.title}
            className="max-h-full max-w-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageOff size={40} className="text-amber-600/50" />
        )}
      </div>

      <h3 className="mb-1 w-full truncate text-center text-sm font-black uppercase tracking-wide text-white">
        {caseInstance.caseTemplate.title}
      </h3>

      <button
        onClick={() => onSelect(caseInstance.id)}
        disabled={disabled}
        className="mt-4 w-full cursor-pointer rounded bg-tactical-accent py-2 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-tactical-accent/80 disabled:opacity-20"
      >
        Open Case
      </button>
    </div>
  );
};

export default CaseCard;
