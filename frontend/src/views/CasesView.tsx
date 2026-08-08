import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCaseUnboxing } from '../hooks/useCaseUnboxing';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import WeaponCard from '../components/molecules/WeaponCard';
import CaseCard from '../components/atoms/CaseCard';
import type { Weapon } from '../types/weapon';
import type { UserCaseInstance } from '../types/case';
import { Loader2, ArrowLeft } from 'lucide-react';

export const CasesView: React.FC = () => {
  const { profile, loading, refetch } = useUserProfile();

  // Data States
  const [userCases, setUserCases] = useState<UserCaseInstance[]>([]);
  const [weaponPool, setWeaponPool] = useState<Weapon[]>([]);
  const [casesLoading, setCasesLoading] = useState<boolean>(true);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);

  // Unboxing state is managed via hook
  const {
    isOpening,
    unlocked,
    showWinner,
    carouselWeapons,
    translateX,
    carouselContainerRef,
    handleOpenCase,
    resetView,
    handleConfirmReward,
    setShowWinner,
  } = useCaseUnboxing({
    weaponPool,
    selectedInstanceId,
    refetchProfile: refetch,
    setUserCases,
  });

  // Pull initial workspace datasets
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [casesRes, weaponsRes] = await Promise.all([api.getUserCases(), api.getWeapons()]);
        setUserCases(casesRes);
        setWeaponPool(weaponsRes);
      } catch (error) {
        console.error('Failed to load cases workspace:', error);
      } finally {
        setCasesLoading(false);
      }
    };
    loadInitialData();
  }, []);

  if (casesLoading || (loading && !profile)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // --- Render Stage 2: Ticker tape unboxing workspace views ---
  if (selectedInstanceId) {
    const activeCase = userCases.find((c) => c.id === selectedInstanceId);

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 py-10">
        <div className="flex w-full items-center justify-between px-6">
          <button
            onClick={resetView}
            disabled={isOpening && !showWinner}
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Back to Inventory</span>
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">
              {activeCase?.caseTemplate.title || 'MINICS Case'}
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Opening {activeCase?.caseTemplate.title || 'Case'}
            </p>
          </div>
        </div>

        <div className="relative mb-8 mt-12 w-full overflow-hidden border-y border-white/10 bg-tactical-gray/30 py-10 shadow-2xl">
          <div className="absolute bottom-0 left-1/2 top-0 z-20 w-1 -translate-x-1/2 bg-tactical-accent/80 shadow-[0_0_15px_rgba(125,1,227,0.8)]"></div>

          <div ref={carouselContainerRef} className="relative h-64 w-full overflow-hidden">
            {carouselWeapons.length > 0 ? (
              <div
                className="ease-cs2-spin absolute left-0 flex gap-2 transition-transform will-change-transform"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transitionDuration: isOpening && translateX !== 0 ? '8000ms' : '0ms',
                }}
                onTransitionEnd={() => {
                  if (translateX !== 0) setShowWinner(true);
                }}
              >
                {carouselWeapons.map((weapon, idx) => (
                  <div key={weapon.uniqueId || idx} className="w-48 shrink-0">
                    <WeaponCard weapon={weapon} isFlippable={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-black uppercase tracking-widest text-zinc-600">
                Awaiting User...
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {!isOpening ? (
            <button
              onClick={handleOpenCase}
              className="rounded-lg bg-tactical-accent px-12 py-4 font-black uppercase tracking-widest text-black shadow-xl transition-all hover:scale-105 hover:bg-tactical-accent/80 active:scale-95"
            >
              Open Case
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-3 rounded-lg bg-zinc-800 px-12 py-4 font-black uppercase tracking-widest text-zinc-500 shadow-xl"
            >
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </button>
          )}
        </div>

        {/* Winner Modal */}
        {showWinner && unlocked && (
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm duration-300">
            <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl border border-tactical-accent/30 bg-tactical-gray p-10 shadow-2xl">
              <div className="absolute top-0 h-2 w-full bg-gradient-to-r from-transparent via-tactical-accent to-transparent opacity-50"></div>
              <h3 className="mb-6 text-xl font-black uppercase tracking-widest text-tactical-accent">
                Item Acquired
              </h3>
              <WeaponCard weapon={unlocked} isFlippable={false} />
              <button
                onClick={() => handleConfirmReward(() => setSelectedInstanceId(null))}
                className="mt-8 w-full rounded-lg bg-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
              >
                Back to Cases
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render Stage 1: Grid inventory array display selector screen ---
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 py-16">
      <div className="text-center">
        <h2 className="mb-2 text-4xl font-black uppercase tracking-widest text-white">
          Your available Cases
        </h2>
        <p className="mx-auto max-w-xl text-sm font-medium text-zinc-400">
          You have <span className="font-bold text-tactical-accent">{userCases.length}</span>{' '}
          individual cases stored in your profile allocations. Choose a case below to access the
          decryption terminal.
        </p>
      </div>

      {userCases.length === 0 ? (
        <div className="w-full max-w-lg rounded-2xl border-2 border-dashed border-white/5 bg-tactical-gray/20 py-16 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
          No available cases
        </div>
      ) : (
        <div className="mt-4 grid w-full grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {userCases.map((caseInstance) => (
            <CaseCard
              key={caseInstance.id}
              caseInstance={caseInstance}
              onSelect={setSelectedInstanceId}
              disabled={isOpening}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CasesView;
