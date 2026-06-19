import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2 } from 'lucide-react';

const BattleView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [matchState, setMatchState] = useState<any>(null);

  useEffect(() => {
    if (matchId) api.getMatchState(parseInt(matchId)).then(setMatchState);
  }, [matchId]);

  if (!matchState) return <Loader2 className="animate-spin text-tactical-accent mx-auto" size={48} />;

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="bg-red-900/20 p-4 border-b border-red-500/50">Opponent HP: {matchState.playerBStatus}</div>
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">{matchState.log}</div>
      <div className="bg-tactical-gray/50 p-4 border-t border-white/10 flex gap-4">
        {/* Simplified for demo: actions */}
        <p className="text-white">Your Health: {matchState.playerAStatus}</p>
      </div>
    </div>
  );
};

export default BattleView;
