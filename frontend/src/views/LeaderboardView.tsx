import React from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import type { LeaderboardEntry } from '../types/user';

const LeaderboardView: React.FC = () => {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return <LoadingSpinner label="Loading Rankings..." />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-8 text-3xl font-black uppercase text-white">Top Players</h2>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
            <th className="p-4">Rank</th>
            <th className="p-4">Username</th>
            <th className="p-4">ELO</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry: LeaderboardEntry, index: number) => (
            <tr key={entry.username} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 font-mono">{index + 1}</td>
              <td className="p-4">{entry.username}</td>
              <td className="p-4 font-bold text-tactical-accent">{entry.elo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardView;
