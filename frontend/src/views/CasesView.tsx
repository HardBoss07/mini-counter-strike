import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { Loader2 } from "lucide-react";
import WeaponCard from "../components/molecules/WeaponCard";
import type { Weapon } from "../components/molecules/WeaponCard";

const CasesView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [unlocked, setUnlocked] = useState<Weapon | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    api.getUserProfile().then(setProfile);
  }, []);

  const handleOpen = async () => {
    setIsOpening(true);
    setUnlocked(null);
    try {
      const result = await api.openCase();
      // Mocked delay for roulette animation
      await new Promise((r) => setTimeout(r, 2000));
      setUnlocked({
        id: 0,
        name: result.weaponName,
        imageUrl: result.imageUrl,
        description: result.rarity,
      } as any);
    } finally {
      setIsOpening(false);
    }
  };

  if (!profile)
    return (
      <Loader2
        className="animate-spin text-tactical-accent mx-auto"
        size={48}
      />
    );

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
        className="bg-tactical-accent text-black font-black px-12 py-4 rounded-lg uppercase tracking-widest disabled:opacity-30"
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
