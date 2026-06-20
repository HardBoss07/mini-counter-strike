import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Loader2, Play, Pause, RotateCcw, Shield, Flame, 
  EyeOff, Heart, Zap, ArrowLeft, Trophy 
} from 'lucide-react';

interface WeaponArchetype {
  id: number;
  name: string;
  type: 'WEAPON' | 'UTILITY';
  side: string;
  energyCost: number;
  damage: number;
  drawWeight: number;
  critChance: number;
  critMultiplier: number;
  statusEffect: string;
  imageUrl?: string;
  description?: string;
}

interface PlayerState {
  playerId: number;
  username: string;
  hp: number;
  energy: number;
  hand: WeaponArchetype[];
  activeEffects: string[];
}

interface CombatRoundRecord {
  turnNumber: number;
  playerA: PlayerState;
  playerB: PlayerState;
  actionLog: string;
  actingPlayerId: number;
}

const BattleView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<CombatRoundRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [showResults, setShowResults] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    api.getMatchLogs(parseInt(matchId))
      .then((data) => {
        if (!data || data.length === 0) {
          setError('No combat logs found for this match.');
        } else {
          setLogs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load match replay.');
        setLoading(false);
      });
  }, [matchId]);

  // Auto-scroll the logs container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  // Replay timer loop
  useEffect(() => {
    if (!isPlaying || logs.length === 0 || showResults) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= logs.length - 1) {
          setIsPlaying(false);
          setShowResults(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / speed);

    return () => clearInterval(intervalId);
  }, [isPlaying, logs, speed, showResults]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tactical-dark gap-4">
        <Loader2 className="animate-spin text-tactical-accent" size={64} />
        <p className="text-gray-400 font-mono">Fetching tactical replay logs...</p>
      </div>
    );
  }

  if (error || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tactical-dark gap-6">
        <p className="text-red-500 font-mono text-xl">{error || 'Replay unavailable'}</p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-tactical-gray border border-white/10 px-6 py-3 rounded-lg text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const currentRecord = logs[currentIndex];
  const round2StartIndex = logs.findIndex((rec, idx) => idx > 0 && rec.turnNumber === 1);
  const currentRound = (round2StartIndex === -1 || currentIndex < round2StartIndex) ? 1 : 2;

  // Determine Sides: Round 1 has Player A as T, Player B as CT. Round 2 swaps them.
  const playerASide = currentRound === 1 ? 'T' : 'CT';
  const playerBSide = currentRound === 1 ? 'CT' : 'T';

  const playerAColor = playerASide === 'T' ? 'text-tactical-t border-tactical-t/30 bg-tactical-t/5' : 'text-tactical-ct border-tactical-ct/30 bg-tactical-ct/5';
  const playerBColor = playerBSide === 'T' ? 'text-tactical-t border-tactical-t/30 bg-tactical-t/5' : 'text-tactical-ct border-tactical-ct/30 bg-tactical-ct/5';

  const handleRewind = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    setShowResults(false);
  };

  const handleSkip = () => {
    setCurrentIndex(logs.length - 1);
    setIsPlaying(false);
    setShowResults(true);
  };

  // Status effect helper
  const renderStatusEffects = (effects: string[]) => {
    if (!effects || effects.length === 0) return null;
    return (
      <div className="flex gap-1.5 mt-1">
        {effects.map((eff, i) => {
          if (eff.includes('BURN')) {
            return (
              <span key={i} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-red-950 border border-red-500/30 text-red-400 rounded uppercase">
                <Flame size={10} className="animate-pulse" /> Burn
              </span>
            );
          }
          if (eff.includes('BLIND')) {
            return (
              <span key={i} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-yellow-950 border border-yellow-500/30 text-yellow-400 rounded uppercase">
                <EyeOff size={10} /> Blinded
              </span>
            );
          }
          if (eff.includes('SKIP') || eff.includes('BLOCKED')) {
            return (
              <span key={i} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-500/30 text-slate-400 rounded uppercase">
                <Shield size={10} /> Blocked
              </span>
            );
          }
          return (
            <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded uppercase">
              {eff}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-tactical-dark text-white flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-tactical-gray/40 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
            title="Leave Replay"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xs font-mono tracking-widest text-tactical-accent font-bold uppercase">Tactical Strike // Replay</h1>
            <p className="text-xs text-gray-400 font-mono">Match ID: {matchId}</p>
          </div>
        </div>

        {/* Round and Turn indicators */}
        <div className="flex items-center gap-8 font-mono">
          <div className="text-center">
            <span className="text-[10px] text-gray-500 block uppercase">Round</span>
            <span className="text-lg font-black text-white">{currentRound} / 2</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gray-500 block uppercase">Turn</span>
            <span className="text-lg font-black text-white">{currentRecord.turnNumber}</span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Panel */}
      <main className="flex-1 flex flex-col md:grid md:grid-rows-[auto_1fr_auto] gap-4 p-4 max-w-6xl w-full mx-auto overflow-hidden">
        
        {/* Opponent HUD (Player B) */}
        <div className={`p-4 rounded-xl border transition-colors ${playerBColor}`}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider px-2 py-0.5 bg-white/10 rounded-sm font-bold">
                  {playerBSide}
                </span>
                <h3 className="text-lg font-black tracking-wide">{currentRecord.playerB.username}</h3>
              </div>
              {renderStatusEffects(currentRecord.playerB.activeEffects)}
            </div>

            {/* Health and Energy Summary */}
            <div className="flex items-center gap-6 font-mono text-right">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase">Energy</span>
                <div className="flex gap-1 justify-end mt-1">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2.5 h-4 rounded-sm border ${
                        idx < currentRecord.playerB.energy 
                          ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_5px_rgba(234,179,8,0.5)]' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block uppercase">HP</span>
                <span className="text-2xl font-black text-white">{currentRecord.playerB.hp}</span>
              </div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden mt-3 border border-white/5">
            <div 
              className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500" 
              style={{ width: `${currentRecord.playerB.hp}%` }}
            />
          </div>
        </div>

        {/* Central Logs Arena */}
        <div className="flex-1 flex flex-col min-h-[250px] md:min-h-0 bg-tactical-gray/60 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden relative">
          {/* Scrollable Logs */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-400 space-y-2.5 custom-scrollbar"
          >
            {logs.slice(0, currentIndex + 1).map((rec, idx) => {
              const isLatest = idx === currentIndex;
              return (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded border transition-all duration-300 ${
                    isLatest 
                      ? 'bg-tactical-accent/10 border-tactical-accent/40 text-white shadow-[0_0_10px_rgba(125,1,227,0.15)] scale-[1.01]' 
                      : 'bg-black/20 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-[10px]">
                    <span className="text-gray-500">T. {rec.turnNumber}</span>
                    <span className="text-tactical-accent font-bold">
                      {rec.actingPlayerId === rec.playerA.playerId ? rec.playerA.username : rec.playerB.username}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{rec.actionLog}</p>
                </div>
              );
            })}
          </div>

          {/* Focus Action Overlay (Micro-animation of the last turn action) */}
          <div className="p-4 bg-black/50 border-t border-white/5 text-center font-mono flex items-center justify-center min-h-[64px]">
            <p className="text-tactical-accent font-black tracking-wide uppercase text-sm animate-pulse">
              {currentRecord.actionLog}
            </p>
          </div>
        </div>

        {/* Player HUD (Player A) */}
        <div className={`p-4 rounded-xl border transition-colors ${playerAColor}`}>
          {/* Health Bar */}
          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden mb-3 border border-white/5">
            <div 
              className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500" 
              style={{ width: `${currentRecord.playerA.hp}%` }}
            />
          </div>

          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider px-2 py-0.5 bg-white/10 rounded-sm font-bold">
                  {playerASide}
                </span>
                <h3 className="text-lg font-black tracking-wide">{currentRecord.playerA.username}</h3>
              </div>
              {renderStatusEffects(currentRecord.playerA.activeEffects)}
            </div>

            {/* Health and Energy Summary */}
            <div className="flex items-center gap-6 font-mono text-right">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase">HP</span>
                <span className="text-2xl font-black text-white">{currentRecord.playerA.hp}</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block uppercase">Energy</span>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2.5 h-4 rounded-sm border ${
                        idx < currentRecord.playerA.energy 
                          ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_5px_rgba(234,179,8,0.5)]' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Hand Card Draw */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <span className="text-[10px] text-gray-500 font-mono block uppercase mb-2">Active Turn Hand</span>
            <div className="grid grid-cols-3 gap-2">
              {currentRecord.playerA.hand && currentRecord.playerA.hand.length > 0 ? (
                currentRecord.playerA.hand.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-tactical-gray/90 border border-white/10 rounded-lg p-2.5 flex flex-col justify-between min-h-[90px] shadow-lg relative group overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-black truncate text-white">{item.name}</h4>
                      <span className="bg-yellow-500/20 text-yellow-400 text-[9px] font-mono px-1 rounded flex items-center gap-0.5">
                        <Zap size={8} /> {item.energyCost}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-end">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.type === 'WEAPON' ? `DMG: ${item.damage}` : 'UTILITY'}
                      </span>
                      {item.statusEffect && item.statusEffect !== 'NONE' && (
                        <span className="text-[8px] bg-tactical-accent/20 border border-tactical-accent/40 text-tactical-accent px-1 rounded uppercase tracking-tighter">
                          {item.statusEffect.split('_')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-xs font-mono text-gray-600">
                  No Hand Drawn
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Control Console */}
      <footer className="bg-tactical-gray/80 border-t border-white/5 p-4 backdrop-blur-md z-10">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Progress Slider */}
          <div className="w-full flex items-center gap-3 font-mono text-xs">
            <span className="text-gray-500">0</span>
            <input 
              type="range" 
              min={0} 
              max={logs.length - 1} 
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tactical-accent"
            />
            <span className="text-gray-400">{currentIndex + 1} / {logs.length}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={handleRewind}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95"
              title="Restart Replay"
            >
              <RotateCcw size={16} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-tactical-accent hover:bg-tactical-accent/90 text-white transition-all shadow-[0_0_20px_rgba(125,1,227,0.4)] active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button 
              onClick={handleSkip}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95"
              title="Skip to Results"
            >
              <Trophy size={16} />
            </button>
          </div>

          {/* Playback speed selector */}
          <div className="flex gap-1.5 font-mono text-xs">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded border transition-all ${
                  speed === s 
                    ? 'bg-tactical-accent border-tactical-accent text-white shadow-[0_0_10px_rgba(125,1,227,0.3)]' 
                    : 'bg-black/30 border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

        </div>
      </footer>

      {/* Results overlay modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-tactical-gray border border-white/10 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl">
            {/* Ambient glowing effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-tactical-accent/10 rounded-full blur-3xl" />

            <Trophy className="mx-auto text-tactical-accent mb-4 animate-bounce" size={64} />
            
            <h2 className="text-xs font-mono tracking-widest text-tactical-accent font-bold uppercase mb-1">
              Match Completed
            </h2>
            <h3 className="text-3xl font-black uppercase text-white mb-6">
              Simulation Replay Finished
            </h3>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-8 text-left space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Player A</span>
                <span className="font-bold">{logs[logs.length - 1].playerA.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Player B</span>
                <span className="font-bold">{logs[logs.length - 1].playerB.username}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between text-tactical-accent">
                <span>Final Turn Count</span>
                <span className="font-bold">{logs.length} turns</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-tactical-accent text-white font-bold text-lg py-4 rounded-xl hover:bg-tactical-accent/90 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(125,1,227,0.4)]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BattleView;
