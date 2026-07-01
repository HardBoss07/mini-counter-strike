import React, { useState } from "react";
import { api } from "../utils/api";
import { useUserProfile } from "../hooks/useUserProfile";
import { invalidateProfileCache } from "../hooks/useUserProfile";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import WeaponCard from "../components/molecules/WeaponCard";
import { mapBackendWeapon } from "../types/weapon";
import type { Weapon } from "../types/weapon";
import { Loader2 } from "lucide-react";

const CasesView: React.FC = () => {
  const { profile, loading, refetch } = useUserProfile();
  const [unlocked, setUnlocked] = useState<Weapon | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  const handleOpen = async (): Promise<void> => {
    setIsOpening(true);
    setUnlocked(null);
    try {
      const result = await api.openCase();
      // Simulated delay for the unboxing animation
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      setUnlocked(
        mapBackendWeapon({
          id: 0,
          name: result.weaponName,
          imageUrl: result.imageUrl,
          rarity: result.rarity,
          description: result.rarity,
        } as Parameters<typeof mapBackendWeapon>[0]),
      );
      // Invalidate profile cache so caseCount updates in Navbar
      invalidateProfileCache();
      refetch();
    } catch (openError: unknown) {
      console.error("Failed to open case:", openError);
    } finally {
      setIsOpening(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Preparing Case Inventory..." />;
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center gap-12 py-16">
      <h2 className="text-4xl font-black uppercase tracking-widest">
        Cases Available: {profile.caseCount}
      </h2>

      <div className="w-64 h-64 bg-tactical-gray rounded-2xl border-4 border-dashed border-tactical-accent flex items-center justify-center">
        {isOpening ? <Loader2 className="animate-spin" size={64} /> : "CASE"}
      </div>

      <button
        onClick={handleOpen}
        disabled={isOpening || profile.caseCount === 0}
        className="bg-tactical-accent text-black font-black px-12 py-4 rounded-lg uppercase tracking-widest disabled:opacity-30 hover:bg-tactical-accent/80 transition-colors"
      >
        Open Case
      </button>

      {unlocked && (
        <div className="text-center animate-bounce">
          <p className="text-tactical-accent font-bold mb-4">YOU UNBOXED:</p>
          <WeaponCard weapon={unlocked} isDraggable={false} />
        </div>
      )}
    </div>
  );
};

export default CasesView;
