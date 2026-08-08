import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchStream } from '../hooks/useMatchStream';
import { useMatchStats } from '../hooks/useMatchStats';
import WeaponCard from '../components/molecules/WeaponCard';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import ErrorToast from '../components/atoms/ErrorToast';
import { Heart, ArrowLeft, Swords, Briefcase, Trophy } from 'lucide-react';
import type { PlayerHandItem } from '../types/match';
import EnergyBar from '../components/atoms/EnergyBar';

// ---------------------------------------------------------------------------
// Sub-components (view-scoped, not globally reusable)
// ---------------------------------------------------------------------------

interface PlayerCardProps {
  label: string;
  hp: string;
  energy: number;
  isViewer: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ label, hp, energy, isViewer }) => {
  const hpValue = parseInt(hp, 10);

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-black/20 p-6 text-center transition-all duration-300 ${
        isViewer
          ? 'border-tactical-accent/30 shadow-[0_0_15px_rgba(197,160,89,0.05)]'
          : 'border-white/5'
      }`}
    >
      <h2
        className={`text-sm font-black uppercase tracking-wider ${
          isViewer ? 'text-tactical-accent' : 'text-gray-400'
        }`}
      >
        {label}
      </h2>
      <div className="flex items-center justify-center gap-3 text-red-500">
        <Heart
          size={32}
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDuration: hpValue < 30 ? '0.5s' : '2s' }}
        />
        <span className="font-mono text-5xl font-black">{hp}</span>
      </div>
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-red-500 transition-all duration-500 ease-out"
          style={{ width: `${hp}%` }}
        />
      </div>
      <EnergyBar current={energy} />
    </div>
  );
};

interface CombatLogProps {
  lastLog: string;
  isCompleted: boolean;
  isMyTurn: boolean;
}

const CombatLog: React.FC<CombatLogProps> = ({ lastLog, isCompleted, isMyTurn }) => (
  <div className="flex h-64 flex-col justify-between rounded-xl border border-white/5 bg-black/30 p-6 shadow-inner">
    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
      <Swords size={18} className="text-tactical-accent" />
      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
        Encounter Narrative Feed
      </h3>
    </div>
    <p className="animate-fade-in py-4 text-center font-mono text-sm italic text-gray-300 transition-all duration-300">
      "{lastLog || 'Tactical positioning initialized. Waiting for structural actions.'}"
    </p>
    <div className="text-center">
      {isCompleted ? (
        <span className="rounded bg-tactical-accent px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(197,160,89,0.3)]">
          Combat Terminated
        </span>
      ) : isMyTurn ? (
        <span className="animate-bounce rounded bg-green-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          Your Strategic Turn
        </span>
      ) : (
        <span className="rounded bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
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

  const { matchState, loading, submitting, error, viewerUsername, submitAction, surrender } =
    useMatchStream(matchId);

  // Hook handles all string parsing and role derivations
  const {
    hpA,
    hpB,
    playerAEnergy,
    playerBEnergy,
    viewerEnergy,
    isCompleted,
    isUserPlayerA,
    labelA,
    labelB,
    viewerHp,
    opponentHp,
  } = useMatchStats(matchState, viewerUsername);

  const handleRetreat = async (): Promise<void> => {
    await surrender();
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Initializing Encounter Link..." />;
  }

  return (
    <div className="animate-fade-in flex min-h-screen select-none flex-col bg-tactical-dark font-sans text-white duration-500">
      {/* HUD Header */}
      <header className="flex items-center justify-between border-b border-white/5 bg-black/20 px-8 py-4">
        <button
          onClick={handleRetreat}
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400 transition-colors hover:text-red-300"
        >
          <ArrowLeft
            size={16}
            className="transform transition-transform group-hover:-translate-x-1"
          />
          Retreat to HQ (Surrender)
        </button>
        <div className="flex items-center gap-4">
          <span className="animate-pulse rounded border border-red-500/20 bg-red-600/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-500">
            Live Combat Zone
          </span>
          <span className="text-sm font-bold uppercase text-gray-400">
            Round {matchState?.round ?? 1}
          </span>
        </div>
      </header>

      {error && <ErrorToast message={error} />}

      {/* Main Arena Grid */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-8 p-8 lg:grid-cols-3">
        <PlayerCard label={labelA} hp={hpA} energy={playerAEnergy} isViewer={isUserPlayerA} />
        <CombatLog
          lastLog={matchState?.lastLog ?? ''}
          isCompleted={isCompleted}
          isMyTurn={matchState?.isMyTurn ?? false}
        />
        <PlayerCard label={labelB} hp={hpB} energy={playerBEnergy} isViewer={!isUserPlayerA} />
      </main>

      {/* Action Tray */}
      <footer className="mt-auto flex flex-col gap-4 border-t border-white/5 bg-black/40 p-8 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-tactical-accent" />
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
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
                  className="group relative block h-64 w-48 transform text-left transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] focus:outline-none disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  <WeaponCard weapon={handItem} currentEnergy={viewerEnergy} />

                  {matchState.isMyTurn && !isCompleted && (
                    <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-tactical-accent bg-tactical-accent/10 opacity-0 shadow-[0_0_20px_rgba(125,1,227,0.2)] transition-all duration-300 group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center font-mono text-sm text-gray-500">
              {isCompleted
                ? 'Tactical link terminated. Return to dashboard to join a new cycle.'
                : 'Drawing weapon profiles from synchronized armory loadouts...'}
            </div>
          )}
        </div>
      </footer>

      {/* Post-Game Overlay */}
      {isCompleted && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl transition-opacity duration-500">
          <div className="animate-slide-up relative w-full max-w-xl scale-95 transform overflow-hidden rounded-2xl border border-white/10 bg-tactical-gray p-8 text-center shadow-2xl transition-all duration-500">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 animate-pulse rounded-full bg-tactical-accent/20 opacity-60 blur-3xl" />

            <div className="relative mb-4 inline-flex items-center justify-center">
              <Trophy className="relative z-10 text-tactical-accent" size={72} />
              <div className="absolute inset-0 scale-125 animate-ping rounded-full bg-tactical-accent/20 opacity-40 blur-xl" />
            </div>

            <h2 className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-tactical-accent">
              Encounter Concluded
            </h2>

            <h3 className="mb-6 transform text-4xl font-black uppercase tracking-tight transition-all duration-700">
              {viewerHp === '0' ? (
                <span className="tracking-wide text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  Mission Failed
                </span>
              ) : (
                <span className="tracking-wide text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  Victory Secured
                </span>
              )}
            </h3>

            {/* Match Metrics */}
            <div className="relative z-10 mb-8 space-y-4 rounded-xl border border-white/5 bg-black/50 p-5 text-left font-mono text-sm shadow-inner">
              <h4 className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-black uppercase tracking-wider text-gray-400">
                <span>Tactical Metrics Log</span>
                <span className="font-mono text-[10px] normal-case text-tactical-accent">
                  ID: #{matchId}
                </span>
              </h4>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs text-gray-500">Your Ending Vitals:</span>
                <span
                  className={`text-base font-bold ${viewerHp === '0' ? 'text-red-400 line-through' : 'text-green-400'}`}
                >
                  {viewerHp} HP
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs text-gray-500">Opponent Ending Vitals:</span>
                <span
                  className={`text-base font-bold ${opponentHp === '0' ? 'text-red-400 line-through' : 'text-green-400'}`}
                >
                  {opponentHp} HP
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-gray-500">Combat Chrono Rounds:</span>
                <span className="rounded border border-tactical-accent/20 bg-tactical-accent/10 px-2 py-0.5 font-bold text-tactical-accent">
                  Round {matchState?.round}
                </span>
              </div>

              <div className="relative overflow-hidden rounded border border-white/5 bg-black/40 p-3 text-xs italic text-gray-300">
                <span className="mb-1 block text-[9px] font-black uppercase not-italic tracking-widest text-gray-500">
                  Final Log Trace
                </span>
                "{matchState?.lastLog}"
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl bg-tactical-accent py-4 text-lg font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(197,160,89,0.15)] transition-all hover:scale-[1.01] hover:bg-tactical-accent/90 hover:shadow-[0_0_40px_rgba(197,160,89,0.3)] active:scale-[0.99]"
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
