import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2 } from 'lucide-react';

const MatchmakingView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let ticketId: number;
    
    const startQueue = async () => {
      const response = await api.queueMatch();
      ticketId = response.ticketId;
      pollStatus();
    };

    const pollStatus = () => {
      const interval = setInterval(async () => {
        const res = await api.getQueueStatus(ticketId);
        if (res.status === 'MATCH_FOUND' && res.matchId) {
          clearInterval(interval);
          navigate(`/battle/${res.matchId}`);
        }
      }, 3000);
    };

    startQueue();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <Loader2 className="animate-spin text-tactical-accent" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">Searching for opponents...</h2>
    </div>
  );
};

export default MatchmakingView;
