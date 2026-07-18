import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatchStream } from "../hooks/useMatchStream";
import { useMatchStats } from "../hooks/useMatchStats";
import WeaponCard from "../components/molecules/WeaponCard";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import ErrorToast from "../components/atoms/ErrorToast";
import { Heart, ArrowLeft, Swords, Briefcase, Trophy } from "lucide-react";
import type { PlayerHandItem } from "../types/match";

// ---------------------------------------------------------------------------
// Sub-components (view-scoped, not globally reusable)
// ---------------------------------------------------------------------------

interface PlayerCardProps {
  label: string;
  hp: string;
  isViewer: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ label, hp, isViewer }) => {
  const hpValue = parseInt(hp, 10);

  return (
    <div
      className={`border rounded-xl p-6 flex flex-col gap-4 text-center bg-black/20 transition-all duration-300 ${
        isViewer
          ? "border-tactical-accent/30 shadow-[0_0_15px_rgba(197,160,89,0.05)]"
          : "border-white/5"
      }`}
    >
      <h2
        className={`font-black uppercase tracking-wider text-sm ${
          isViewer ? "text-tactical-accent" : "text-gray-400"
        }`}
      >
        {label}
      </h2>
      <div className="flex items-center justify-center gap-3 text-red-500">
        <Heart
          size={32}
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDuration: hpValue < 30 ? "0.5s" : "2s" }}
        />
        <span className="text-5xl font-black font-mono">{hp}</span>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <div
          className="bg-red-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${hp}%` }}
        />
      </div>
    </div>
  );
};

interface CombatLogProps {
  lastLog: string;
  isCompleted: boolean;
  isMyTurn: boolean;
}

const CombatLog: React.FC<CombatLogProps> = ({
  lastLog,
  isCompleted,
  isMyTurn,
}) => (
  <div className="bg-black/30 border border-white/5 rounded-xl p-6 h-64 flex flex-col justify-between shadow-inner">
    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
      <Swords size={18} className="text-tactical-accent" />
      <h3 className="font-black uppercase tracking-wider text-xs text-gray-400">
        Encounter Narrative Feed
      </h3>
    </div>
    <p className="font-mono text-sm text-gray-300 text-center italic py-4 transition-all duration-300 animate-fade-in">
      "
      {lastLog ||
        "Tactical positioning initialized. Waiting for structural actions."}
      "
    </p>
    <div className="text-center">
      {isCompleted ? (
        <span className="text-xs bg-tactical-accent text-black font-black uppercase px-4 py-1.5 rounded tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.3)]">
          Combat Terminated
        </span>
      ) : isMyTurn ? (
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
);

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

const BattleView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const {
    matchState,
    loading,
    submitting,
    error,
    viewerUsername,
    submitAction,
    surrender,
  } = useMatchStream(matchId);

  // Hook handles all string parsing and role derivations
  const {
    hpA,
    hpB,
    isCompleted,
    isUserPlayerA,
    labelA,
    labelB,
    viewerHp,
    opponentHp,
  } = useMatchStats(matchState, viewerUsername);

  const handleRetreat = async (): Promise<void> => {
    await surrender();
    navigate("/");
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Initializing Encounter Link..." />;
  }

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
          />
          Retreat to HQ (Surrender)
        </button>
        <div className="flex items-center gap-4">
          <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded text-xs font-black uppercase tracking-widest animate-pulse">
            Live Combat Zone
          </span>
          <span className="text-sm font-bold uppercase text-gray-400">
            Round {matchState?.round ?? 1}
          </span>
        </div>
      </header>

      {error && <ErrorToast message={error} />}

      {/* Main Arena Grid */}
      <main className="flex-1 grid lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto w-full items-start">
        <PlayerCard label={labelA} hp={hpA} isViewer={isUserPlayerA} />
        <CombatLog
          lastLog={matchState?.lastLog ?? ""}
          isCompleted={isCompleted}
          isMyTurn={matchState?.isMyTurn ?? false}
        />
        <PlayerCard label={labelB} hp={hpB} isViewer={!isUserPlayerA} />
      </main>

      {/* Action Tray */}
      <footer className="mt-auto bg-black/40 border-t border-white/5 p-8 flex flex-col gap-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-tactical-accent" />
            <h4 className="font-black uppercase tracking-widest text-xs text-gray-400">
              Active Tactical Suitcase (Loadout Deck)
            </h4>
          </div>

          {matchState?.playerHand && matchState.playerHand.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {matchState.playerHand.map((handItem: PlayerHandItem) => (
                <button
                  key={handItem.id}
                  disabled={!matchState.isMyTurn || submitting || isCompleted}
                  onClick={() => submitAction(handItem.id)}
                  className="group relative w-48 h-64 block text-left transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:scale-100 focus:outline-none"
                >
                  <WeaponCard weapon={handItem} />
                  {matchState.isMyTurn && !isCompleted && (
                    <div className="absolute inset-0 bg-tactical-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-300 border-2 border-tactical-accent rounded-lg pointer-events-none shadow-[0_0_20px_rgba(125,1,227,0.2)]" />
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

      {/* Post-Game Overlay */}
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
              {viewerHp === "0" ? (
                <span className="text-red-500 tracking-wide drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  Mission Failed
                </span>
              ) : (
                <span className="text-green-500 tracking-wide drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  Victory Secured
                </span>
              )}
            </h3>

            {/* Match Metrics */}
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
                  className={`font-bold text-base ${viewerHp === "0" ? "text-red-400 line-through" : "text-green-400"}`}
                >
                  {viewerHp} HP
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 text-xs">
                  Opponent Ending Vitals:
                </span>
                <span
                  className={`font-bold text-base ${opponentHp === "0" ? "text-red-400 line-through" : "text-green-400"}`}
                >
                  {opponentHp} HP
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
