import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Loader2, X } from "lucide-react";

const MatchmakingView: React.FC = () => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const matchFoundRef = useRef(false);

  useEffect(() => {
    let isMounted = true; // <-- NEW: Tracks if component is alive
    let ticketId: number;
    let interval: any;

    const startQueue = async () => {
      try {
        const response = await api.queueMatch();

        // <-- NEW: If user cancelled while request was in flight, stop right here.
        if (!isMounted) return;

        ticketId = response.ticketId;
        pollStatus();
      } catch (err) {
        console.error("Failed to initialize matchmaking queue ticket:", err);
      }
    };

    const pollStatus = () => {
      interval = setInterval(async () => {
        if (!isMounted) {
          clearInterval(interval);
          return;
        }

        try {
          const res = await api.getQueueStatus(ticketId);
          if (res.status === "MATCH_FOUND" && res.matchId) {
            matchFoundRef.current = true;
            clearInterval(interval);
            navigate(`/battle/${res.matchId}`);
          }
        } catch (err) {
          console.error("Error fetching queue allocation parameters:", err);
        }
      }, 500);
    };

    startQueue();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);

      if (!matchFoundRef.current) {
        api
          .leaveQueue()
          .catch((err) => console.error("Failed safeguard queue leave:", err));
      }
    };
  }, [navigate]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api.leaveQueue();
      matchFoundRef.current = true;
      navigate("/");
    } catch (err) {
      console.error("Failed to leave queue:", err);
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-tactical-dark select-none">
      <Loader2 className="animate-spin text-tactical-accent" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">
        Searching for opponents...
      </h2>
      <p className="text-xs text-gray-500 uppercase tracking-widest">
        Establishing secure battle server tunnel
      </p>

      <button
        onClick={handleCancel}
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
