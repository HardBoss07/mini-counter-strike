import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import LoadingSpinner from "../components/atoms/LoadingSpinner";

function resolveRankLabel(elo: number): string {
  if (elo >= 1500) return "GLOBAL ELITE";
  if (elo >= 1200) return "GOLD";
  return "SILVER";
}

const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  if (loading) {
    return <LoadingSpinner label="Loading Command Center..." />;
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="text-center">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest font-bold">
          Current Rank
        </h2>
        <div className="text-8xl font-black text-tactical-accent drop-shadow-[0_0_15px_rgba(125,1,227,0.5)]">
          {resolveRankLabel(profile.elo)}
        </div>
        <p className="text-2xl font-mono text-white mt-2">{profile.elo} ELO</p>
      </div>

      <button
        onClick={() => navigate("/matchmaking")}
        className="bg-tactical-accent text-black font-black text-xl px-16 py-6 rounded-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(125,1,227,0.3)]"
      >
        Find Match
      </button>
    </div>
  );
};

export default DashboardView;
