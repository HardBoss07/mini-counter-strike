import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2 } from 'lucide-react';

const DashboardView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getUserProfile().then(setProfile).catch(console.error);
  }, []);

  if (!profile) return <Loader2 className="animate-spin text-tactical-accent mx-auto" size={48} />;

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="text-center">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest font-bold">Current Rank</h2>
        <div className="text-8xl font-black text-tactical-accent drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
          {profile.elo >= 1500 ? 'GLOBAL ELITE' : profile.elo >= 1200 ? 'GOLD' : 'SILVER'}
        </div>
        <p className="text-2xl font-mono text-white mt-2">{profile.elo} ELO</p>
      </div>

      <button 
        onClick={() => navigate('/matchmaking')}
        className="bg-tactical-accent text-black font-black text-xl px-16 py-6 rounded-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(197,160,89,0.3)]"
      >
        Find Match
      </button>
    </div>
  );
};

export default DashboardView;
