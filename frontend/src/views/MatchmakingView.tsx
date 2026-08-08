import React from 'react';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { Loader2, X } from 'lucide-react';

const MatchmakingView: React.FC = () => {
  const { isCancelling, cancel } = useMatchmaking();

  return (
    <div className="flex h-screen select-none flex-col items-center justify-center gap-6 bg-tactical-dark">
      <Loader2 className="animate-spin text-tactical-accent" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">
        Searching for opponents...
      </h2>
      <p className="text-xs uppercase tracking-widest text-gray-500">Establishing server tunnel</p>

      <button
        onClick={cancel}
        disabled={isCancelling}
        className="mt-8 flex items-center gap-2 rounded border border-red-500/30 px-6 py-3 text-sm font-bold uppercase tracking-widest text-red-400 transition-all hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50"
      >
        <X size={18} />
        {isCancelling ? 'Cancelling...' : 'Cancel Search'}
      </button>
    </div>
  );
};

export default MatchmakingView;
