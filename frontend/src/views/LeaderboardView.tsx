import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { Loader2 } from "lucide-react";

const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeaderboard()
      .then(setLeaderboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Loader2
        className="animate-spin text-tactical-accent mx-auto"
        size={48}
      />
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black uppercase text-white mb-8">
        Top Players
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-gray-500 uppercase text-xs">
            <th className="p-4">Rank</th>
            <th className="p-4">Username</th>
            <th className="p-4">Elo</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr
              key={entry.username}
              className="border-b border-white/5 hover:bg-white/5"
            >
              <td className="p-4 font-mono">{index + 1}</td>
              <td className="p-4">{entry.username}</td>
              <td className="p-4 font-bold text-tactical-accent">
                {entry.elo}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardView;
