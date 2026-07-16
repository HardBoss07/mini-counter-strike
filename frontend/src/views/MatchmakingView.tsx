import React from "react";
import { useMatchmaking } from "../hooks/useMatchmaking";
import { Loader2, X } from "lucide-react";

const MatchmakingView: React.FC = () => {
  const { isCancelling, cancel } = useMatchmaking();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-tactical-dark select-none">
      <Loader2 className="animate-spin text-tactical-accent" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">
        Searching for opponents...
      </h2>
      <p className="text-xs text-gray-500 uppercase tracking-widest">
        Establishing server tunnel
      </p>

      <button
        onClick={cancel}
        disabled={isCancelling}
        className="mt-8 flex items-center gap-2 px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 rounded uppercase tracking-widest text-sm font-bold transition-all disabled:opacity-50"
      >
        <X size={18} />
        {isCancelling ? "Cancelling..." : "Cancel Search"}
      </button>
    </div>
  );
};

export default MatchmakingView;
