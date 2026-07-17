import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useUserProfile } from "../hooks/useUserProfile";
import { useCaseUnboxing } from "../hooks/useCaseUnboxing";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import WeaponCard from "../components/molecules/WeaponCard";
import CaseCard from "../components/atoms/CaseCard";
import type { Weapon } from "../types/weapon";
import type { UserCaseInstance } from "../types/case";
import { Loader2, ArrowLeft } from "lucide-react";

export const CasesView: React.FC = () => {
  const { profile, loading, refetch } = useUserProfile();

  // Data States
  const [userCases, setUserCases] = useState<UserCaseInstance[]>([]);
  const [weaponPool, setWeaponPool] = useState<Weapon[]>([]);
  const [casesLoading, setCasesLoading] = useState<boolean>(true);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null,
  );

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
        const [casesRes, weaponsRes] = await Promise.all([
          api.getUserCases(),
          api.getWeapons(),
        ]);
        setUserCases(casesRes);
        setWeaponPool(weaponsRes);
      } catch (error) {
        console.error("Failed to load cases workspace:", error);
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
      <div className="flex flex-col items-center gap-8 py-10 w-full max-w-6xl mx-auto">
        <div className="w-full flex items-center justify-between px-6">
          <button
            onClick={resetView}
            disabled={isOpening && !showWinner}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            <span className="font-bold uppercase tracking-wider text-sm">
              Back to Inventory
            </span>
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">
              {activeCase?.caseTemplate.title || "MINICS Case"}
            </h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
              Opening {activeCase?.caseTemplate.title || "Case"}
            </p>
          </div>
        </div>

        <div className="w-full relative mt-12 mb-8 bg-tactical-gray/30 border-y border-white/10 py-10 overflow-hidden shadow-2xl">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-tactical-accent/80 z-20 shadow-[0_0_15px_rgba(125,1,227,0.8)] -translate-x-1/2"></div>

          <div
            ref={carouselContainerRef}
            className="w-full relative h-64 overflow-hidden"
          >
            {carouselWeapons.length > 0 ? (
              <div
                className="flex gap-2 transition-transform ease-cs2-spin will-change-transform absolute left-0"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transitionDuration:
                    isOpening && translateX !== 0 ? "8000ms" : "0ms",
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
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-black tracking-widest uppercase">
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
              className="bg-tactical-accent hover:bg-tactical-accent/80 text-black font-black uppercase tracking-widest py-4 px-12 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Open Case
            </button>
          ) : (
            <button
              disabled
              className="bg-zinc-800 text-zinc-500 font-black uppercase tracking-widest py-4 px-12 rounded-lg flex items-center gap-3 shadow-xl"
            >
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </button>
          )}
        </div>

        {/* Winner Modal */}
        {showWinner && unlocked && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-tactical-gray border border-tactical-accent/30 rounded-2xl p-10 flex flex-col items-center max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-transparent via-tactical-accent to-transparent opacity-50"></div>
              <h3 className="text-tactical-accent font-black tracking-widest uppercase mb-6 text-xl">
                Item Acquired
              </h3>
              <WeaponCard weapon={unlocked} isFlippable={false} />
              <button
                onClick={() =>
                  handleConfirmReward(() => setSelectedInstanceId(null))
                }
                className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-colors"
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
    <div className="flex flex-col items-center gap-12 py-16 px-6 w-full max-w-7xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          Your available Cases
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl font-medium mx-auto">
          You have{" "}
          <span className="text-tactical-accent font-bold">
            {userCases.length}
          </span>{" "}
          individual cases stored in your profile allocations. Choose a case
          below to access the decryption terminal.
        </p>
      </div>

      {userCases.length === 0 ? (
        <div className="text-center text-zinc-500 py-16 font-bold uppercase tracking-wider text-xs border-2 border-dashed border-white/5 rounded-2xl w-full max-w-lg bg-tactical-gray/20">
          No available cases
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center w-full mt-4">
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
