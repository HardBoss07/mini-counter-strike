import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import type { MatchStateResponse } from "../utils/api";
import {
  Loader2,
  Heart,
  ArrowLeft,
  Swords,
  Briefcase,
  Trophy,
} from "lucide-react";
import WeaponCard from "../components/molecules/WeaponCard";
import type { Weapon } from "../components/molecules/WeaponCard";

const BattleView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [matchState, setMatchState] = useState<MatchStateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileUsername, setProfileUsername] = useState<string>("");

  useEffect(() => {
    const loadUserIdentity = async () => {
      const stored =
        localStorage.getItem("username") || localStorage.getItem("user");
      if (stored) {
        setProfileUsername(stored);
      } else {
        try {
          const profile = await api.getUserProfile();
          if (profile && profile.username) {
            setProfileUsername(profile.username);
          }
        } catch (e) {
          console.error("Could not fetch identity fallback parameters", e);
        }
      }
    };
    loadUserIdentity();
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const fetchState = async () => {
      try {
        const state = await api.getMatchState(Number(matchId));
        setMatchState(state);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch live state:", err);
        setError("Synchronization issue with tactical encounter server.");
      } finally {
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);

    return () => clearInterval(interval);
  }, [matchId]);

  // Tab Closure Surrender Safety Net
  useEffect(() => {
    if (!matchId || !matchState || matchState.status === "COMPLETED") return;

    const handleTabCloseSurrender = () => {
      const token = localStorage.getItem("token");
      const url = `/api/match/${matchId}/surrender`;
      const headers = {
        type: "application/json",
        Authorization: `Bearer ${token}`,
      };
      const blob = new Blob([JSON.stringify({})], headers);
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener("beforeunload", handleTabCloseSurrender);
    return () => {
      window.removeEventListener("beforeunload", handleTabCloseSurrender);
    };
  }, [matchId, matchState]);

  const handleActionSubmit = async (weaponId: number) => {
    if (!matchId || submitting) return;
    try {
      setSubmitting(true);
      await api.submitAction(Number(matchId), weaponId);
      const updated = await api.getMatchState(Number(matchId));
      setMatchState(updated);
    } catch (err) {
      console.error(err);
      setError("Failed to process battle action.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetreat = async () => {
    if (!matchId) return;
    try {
      await api.surrenderMatch(Number(matchId));
      navigate("/");
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tactical-dark gap-4 text-tactical-accent">
        <Loader2 className="animate-spin" size={48} />
        <span className="font-black uppercase tracking-widest text-sm">
          Initializing Encounter Link...
        </span>
      </div>
    );
  }

  // CRASH PROTECTION: Safe string split lookups with fallback defaults
  const hpA = matchState?.playerAStatus?.includes(":")
    ? matchState.playerAStatus.split(":")[1]
    : "100";
  const hpB = matchState?.playerBStatus?.includes(":")
    ? matchState.playerBStatus.split(":")[1]
    : "100";
  const isCompleted = matchState?.status === "COMPLETED";

  // CRASH PROTECTION: Fail-safe fallbacks for missing properties on immediate load
  const playerAUser = matchState?.playerAUsername || "Player A";
  const playerBUser = matchState?.playerBUsername || "Player B";
  const isUserPlayerA =
    playerAUser.toLowerCase() === profileUsername.toLowerCase();

  const labelA = isUserPlayerA
    ? `${playerAUser} (You)`
    : `${playerAUser} (Opponent)`;
  const labelB = !isUserPlayerA
    ? `${playerBUser} (You)`
    : `${playerBUser} (Opponent)`;

  return (
    <div className="min-h-screen bg-tactical-dark text-white flex flex-col font-sans select-none animate-fade-in duration-500">
      {/* HUD Header */}
      <header className="border-b border-white/5 bg-black/20 px-8 py-4 flex items-center justify-between">
        <button
          onClick={handleRetreat}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors uppercase font-black tracking-wider text-xs group"
        >
          <ArrowLeft
            size={16}
            className="transform group-hover:-translate-x-1 transition-transform"
          />{" "}
          Retreat to HQ (Surrender)
        </button>
        <div className="flex items-center gap-4">
          <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded text-xs font-black uppercase tracking-widest animate-pulse">
            Live Combat Zone
          </span>
          <span className="text-sm font-bold uppercase text-gray-400">
            Round {matchState?.round || 1}
          </span>
        </div>
      </header>

      {error && (
        <div className="bg-red-600 text-white text-center font-bold uppercase tracking-wider p-2 text-xs animate-shake">
          {error}
        </div>
      )}

      {/* Main Arena Grid */}
      <main className="flex-1 grid lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto w-full items-start">
        {/* Left Side: Player A Dashboard */}
        <div
          className={`border rounded-xl p-6 flex flex-col gap-4 text-center bg-black/20 transition-all duration-300 ${isUserPlayerA ? "border-tactical-accent/30 shadow-[0_0_15px_rgba(197,160,89,0.05)]" : "border-white/5"}`}
        >
          <h2
            className={`font-black uppercase tracking-wider text-sm ${isUserPlayerA ? "text-tactical-accent" : "text-gray-400"}`}
          >
            {labelA}
          </h2>
          <div className="flex items-center justify-center gap-3 text-red-500">
            <Heart
              size={32}
              fill="currentColor"
              className="animate-pulse"
              style={{ animationDuration: parseInt(hpA) < 30 ? "0.5s" : "2s" }}
            />
            <span className="text-5xl font-black font-mono">{hpA}</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${hpA}%` }}
            ></div>
          </div>
        </div>

        {/* Center Log Feed */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-6 h-64 flex flex-col justify-between shadow-inner">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Swords size={18} className="text-tactical-accent" />
            <h3 className="font-black uppercase tracking-wider text-xs text-gray-400">
              Encounter Narrative Feed
            </h3>
          </div>
          <p className="font-mono text-sm text-gray-300 text-center italic py-4 transition-all duration-300 animate-fade-in">
            "
            {matchState?.lastLog ||
              "Tactical positioning initialized. Waiting for structural actions."}
            "
          </p>
          <div className="text-center">
            {isCompleted ? (
              <span className="text-xs bg-tactical-accent text-black font-black uppercase px-4 py-1.5 rounded tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                Combat Terminated
              </span>
            ) : matchState?.isMyTurn ? (
              <span className="text-xs bg-green-500 text-black font-black uppercase px-4 py-1.5 rounded tracking-widest animate-bounce shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                Your Strategic Turn
              </span>
            ) : (
              <span className="text-xs bg-white/10 text-gray-400 font-bold uppercase px-4 py-1.5 rounded tracking-widest">
                Awaiting Target Activity...
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Player B Dashboard */}
        <div
          className={`border rounded-xl p-6 flex flex-col gap-4 text-center bg-black/20 transition-all duration-300 ${!isUserPlayerA ? "border-tactical-accent/30 shadow-[0_0_15px_rgba(197,160,89,0.05)]" : "border-white/5"}`}
        >
          <h2
            className={`font-black uppercase tracking-wider text-sm ${!isUserPlayerA ? "text-tactical-accent" : "text-gray-400"}`}
          >
            {labelB}
          </h2>
          <div className="flex items-center justify-center gap-3 text-red-500">
            <Heart
              size={32}
              fill="currentColor"
              className="animate-pulse"
              style={{ animationDuration: parseInt(hpB) < 30 ? "0.5s" : "2s" }}
            />
            <span className="text-5xl font-black font-mono">{hpB}</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${hpB}%` }}
            ></div>
          </div>
        </div>
      </main>

      {/* Interactive Player Action Tray */}
      <footer className="mt-auto bg-black/40 border-t border-white/5 p-8 flex flex-col gap-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-tactical-accent" />
            <h4 className="font-black uppercase tracking-widest text-xs text-gray-400">
              Active Tactical Suitcase (Loadout Deck)
            </h4>
          </div>

          {matchState?.playerHand && matchState.playerHand.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {matchState.playerHand.map((w: any) => (
                <button
                  key={w.id}
                  disabled={!matchState.isMyTurn || submitting || isCompleted}
                  onClick={() => handleActionSubmit(w.id)}
                  className="group relative transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] text-left disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  <WeaponCard weapon={w as Weapon} />
                  {matchState.isMyTurn && !isCompleted && (
                    <div className="absolute inset-0 bg-tactical-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-300 border-2 border-tactical-accent rounded-lg pointer-events-none shadow-[0_0_20px_rgba(197,160,89,0.2)]" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-500 font-mono">
              {isCompleted
                ? "Tactical link terminated. Return to dashboard to join a new cycle."
                : "Drawing weapon profiles from synchronized armory loadouts..."}
            </div>
          )}
        </div>
      </footer>

      {/* Post-Game Detailed Report Overlay Modal */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 transition-opacity duration-500 animate-fade-in">
          <div className="bg-tactical-gray border border-white/10 rounded-2xl p-8 max-w-xl w-full text-center relative overflow-hidden shadow-2xl transition-all duration-500 scale-95 transform animate-slide-up">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-tactical-accent/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />

            <div className="relative inline-flex items-center justify-center mb-4">
              <Trophy
                className="text-tactical-accent relative z-10"
                size={72}
              />
              <div className="absolute inset-0 bg-tactical-accent/20 blur-xl rounded-full scale-125 animate-ping opacity-40" />
            </div>

            <h2 className="text-xs font-mono tracking-widest text-tactical-accent font-bold uppercase mb-1">
              Encounter Concluded
            </h2>

            <h3 className="text-4xl font-black uppercase tracking-tight mb-6 transform transition-all duration-700">
              {(hpA === "0" && isUserPlayerA) ||
              (hpB === "0" && !isUserPlayerA) ? (
                <span className="text-red-500 tracking-wide drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  Mission Failed
                </span>
              ) : (
                <span className="text-green-500 tracking-wide drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  Victory Secured
                </span>
              )}
            </h3>

            {/* Match Metrics Terminal Display */}
            <div className="bg-black/50 border border-white/5 rounded-xl p-5 text-left font-mono text-sm space-y-4 mb-8 relative z-10 shadow-inner">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-white/5 pb-2 flex justify-between items-center">
                <span>Tactical Metrics Log</span>
                <span className="text-[10px] text-tactical-accent font-mono normal-case">
                  ID: #{matchId}
                </span>
              </h4>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 text-xs">
                  Your Ending Vitals:
                </span>
                <span
                  className={`font-bold text-base ${(isUserPlayerA ? hpA : hpB) === "0" ? "text-red-400 line-through" : "text-green-400"}`}
                >
                  {isUserPlayerA ? hpA : hpB} HP
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 text-xs">
                  Opponent Ending Vitals:
                </span>
                <span
                  className={`font-bold text-base ${(isUserPlayerA ? hpB : hpA) === "0" ? "text-red-400 line-through" : "text-green-400"}`}
                >
                  {isUserPlayerA ? hpB : hpA} HP
                </span>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-3 items-center">
                <span className="text-gray-500 text-xs">
                  Combat Chrono Rounds:
                </span>
                <span className="font-bold text-tactical-accent bg-tactical-accent/10 px-2 py-0.5 rounded border border-tactical-accent/20">
                  Round {matchState?.round}
                </span>
              </div>

              <div className="bg-black/40 p-3 rounded border border-white/5 text-xs text-gray-300 italic relative overflow-hidden">
                <span className="block text-[9px] uppercase font-black tracking-widest text-gray-500 not-italic mb-1">
                  Final Log Trace
                </span>
                "{matchState?.lastLog}"
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-tactical-accent text-black font-black text-lg py-4 rounded-xl hover:bg-tactical-accent/90 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(197,160,89,0.15)] hover:shadow-[0_0_40px_rgba(197,160,89,0.3)]"
            >
              Acknowledge and Return to Base
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleView;
