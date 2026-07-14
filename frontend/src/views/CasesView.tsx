import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import { useUserProfile } from "../hooks/useUserProfile";
import { invalidateProfileCache } from "../hooks/useUserProfile";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import WeaponCard from "../components/molecules/WeaponCard";
import CaseCard from "../components/atoms/CaseCard";
import { mapBackendWeapon } from "../types/weapon";
import type { Weapon } from "../types/weapon";
import type { UserCaseInstance } from "../types/case";
import { Loader2, ArrowLeft } from "lucide-react";

export const CasesView: React.FC = () => {
  const { profile, loading, refetch } = useUserProfile();
  const [userCases, setUserCases] = useState<UserCaseInstance[]>([]);
  const [weaponPool, setWeaponPool] = useState<Weapon[]>([]);
  const [casesLoading, setCasesLoading] = useState<boolean>(true);

  // Workflow states
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null,
  );
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [unlocked, setUnlocked] = useState<Weapon | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);

  // Animation layout elements
  const [carouselWeapons, setCarouselWeapons] = useState<Weapon[]>([]);
  const [translateX, setTranslateX] = useState<number>(0);
  const reelRef = useRef<HTMLDivElement>(null);

  // Initialize and pull current cases along with master weapon templates
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [casesData, weaponsData] = await Promise.all([
          api.getUserCases(),
          api.getWeapons(),
        ]);
        setUserCases(casesData);
        setWeaponPool(weaponsData);
      } catch (err) {
        console.error("Failed to load cases workspace:", err);
      } finally {
        setCasesLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const getSelectedCaseDetails = (): UserCaseInstance | undefined => {
    return userCases.find((c) => c.id === selectedInstanceId);
  };

  const handleOpen = async (): Promise<void> => {
    if (selectedInstanceId === null || weaponPool.length === 0) return;

    setIsOpening(true);
    setUnlocked(null);
    setShowWinner(false);
    setTranslateX(0); // Reset reel back to starting point

    try {
      // Dispatches request sending explicit target case ID
      const result = await api.openCase(selectedInstanceId);

      const winningWeapon = mapBackendWeapon({
        id: Math.floor(Math.random() * 100000), // Temp runtime identifier
        name: result.weaponName,
        imageUrl: result.imageUrl,
        rarity: result.rarity,
        description: result.rarity,
      } as any);

      // Generate 45 total randomized items to fill the track sequence
      const generatedReel: Weapon[] = [];
      for (let i = 0; i < 45; i++) {
        if (i === 38) {
          // Place our confirmed winning item at index 38
          generatedReel.push(winningWeapon);
        } else {
          // Distribute weapons into the timeline tracking array
          const randomIdx = Math.floor(Math.random() * weaponPool.length);
          generatedReel.push(weaponPool[randomIdx]);
        }
      }

      setCarouselWeapons(generatedReel);
      setUnlocked(winningWeapon);

      // Trigger standard microtask offset so DOM mounts before computing animations
      setTimeout(() => {
        // Precise alignment formula focusing card width adjustments (w-48 = 192px + 8px gap = 200px offset per index)
        const cardWidthWithGap = 200;
        const targetIndex = 38;

        if (reelRef.current) {
          const containerWidth =
            reelRef.current.parentElement?.clientWidth ?? 800;
          const centerShift = containerWidth / 2 - cardWidthWithGap / 2;
          const finalOffset = targetIndex * cardWidthWithGap - centerShift;
          // Shift left onto item center coordinate
          setTranslateX(-finalOffset);
        }
      }, 100);
    } catch (openError: unknown) {
      console.error("Failed to open case:", openError);
      setIsOpening(false);
    }
  };

  const handleAnimationEnd = (): void => {
    setShowWinner(true);
    setIsOpening(false);
    invalidateProfileCache();
    refetch();
    // Remove the opened case from the local layout view configuration
    setUserCases((prev) => prev.filter((c) => c.id !== selectedInstanceId));
  };

  const handleBackToSelection = (): void => {
    if (isOpening) return;
    setSelectedInstanceId(null);
    setUnlocked(null);
    setShowWinner(false);
    setCarouselWeapons([]);
    setTranslateX(0);
  };

  if (loading || casesLoading) {
    return <LoadingSpinner label="Preparing Case Inventory..." />;
  }

  if (!profile) return null;

  // --- Render Stage 2: Ticker tape unboxing workspace views ---
  if (selectedInstanceId !== null) {
    const activeCase = getSelectedCaseDetails();
    return (
      <div className="flex flex-col items-center gap-10 py-12 w-full max-w-6xl mx-auto px-4 select-none">
        <button
          onClick={handleBackToSelection}
          disabled={isOpening}
          className="self-start flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase font-black text-xs tracking-wider disabled:opacity-30 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Case Selection
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-1">
            {activeCase?.caseTemplate.title ?? "Unboxing Arena"}
          </h2>
        </div>

        {/* CSS Marquee Carousel Slider Viewport Container */}
        <div className="w-full relative bg-tactical-dark/90 border-y-2 border-white/10 py-6 overflow-hidden shadow-2xl rounded-xl">
          {/* Authentic CSS Centered Targeting reticle crosshair element indicator */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-tactical-accent z-30 shadow-[0_0_12px_#de9b35] -translate-x-1/2 pointer-events-none" />

          <div
            ref={reelRef}
            style={{
              transform: `translateX(${translateX}px)`,
              transition:
                carouselWeapons.length > 0
                  ? "transform 5.5s cubic-bezier(0.1, 0.8, 0.1, 1)"
                  : "none",
            }}
            onTransitionEnd={handleAnimationEnd}
            className="flex gap-2 px-[50%] transition-transform"
          >
            {carouselWeapons.length > 0 ? (
              carouselWeapons.map((weapon, index) => (
                <div
                  key={`${weapon.id}-${index}`}
                  className="flex-shrink-0 w-48"
                >
                  <WeaponCard weapon={weapon} isDraggable={false} />
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center py-16 text-zinc-500 font-bold uppercase tracking-widest text-sm"></div>
            )}
          </div>
        </div>

        <button
          onClick={handleOpen}
          disabled={isOpening}
          className="bg-tactical-accent text-black font-black px-16 py-4 rounded-xl uppercase tracking-widest text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 cursor-pointer"
        >
          {isOpening ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Opening Case...
            </span>
          ) : (
            "Initiate De-encryption Sequence"
          )}
        </button>

        {showWinner && unlocked && (
          <div className="text-center animate-fade-in mt-4 flex flex-col items-center">
            <p className="text-tactical-accent font-black tracking-widest mb-4 uppercase text-sm animate-pulse">
              ITEM UNBOXED SUCCESSFUL
            </p>
            <WeaponCard weapon={unlocked} isDraggable={false} />
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
          individual containers stored in your profile allocations. Choose a
          case below to access the decryption terminal.
        </p>
      </div>

      {userCases.length === 0 ? (
        <div className="text-center text-zinc-500 py-16 font-bold uppercase tracking-wider text-xs border-2 border-dashed border-white/5 rounded-2xl w-full max-w-lg bg-tactical-gray/20">
          No allocated cases detected inside global system loadouts
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center w-full mt-4">
          {userCases.map((caseInstance) => (
            <CaseCard
              key={caseInstance.id}
              caseInstance={caseInstance}
              onSelect={setSelectedInstanceId}
              disabled={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CasesView;
