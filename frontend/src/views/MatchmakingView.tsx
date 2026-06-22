import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2 } from 'lucide-react';

const MatchmakingView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let ticketId: number;
    let interval: any; // Ideally NodeJS.Timeout but frontend browser constraints may require 'any'

    const startQueue = async () => {
      try {
        const response = await api.queueMatch();
        ticketId = response.ticketId;
        pollStatus();
      } catch (err) {
        console.error("Failed to initialize matchmaking queue ticket:", err);
      }
    };

    const pollStatus = () => {
      interval = setInterval(async () => {
        try {
          const res = await api.getQueueStatus(ticketId);
          if (res.status === 'MATCH_FOUND' && res.matchId) {
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
      if (interval) clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-tactical-dark select-none">
      <Loader2 className="animate-spin text-tactical-accent" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">Searching for opponents...</h2>
      <p className="text-xs font-mono text-gray-500 uppercase tracking-wider animate-pulse">Establishing secure battle server tunnel</p>
    </div>
  );
};

export default MatchmakingView;
