import { useState, useRef } from "react";
import { api } from "../utils/api";
import { invalidateProfileCache } from "./useUserProfile";
import type { Weapon } from "../types/weapon";
import type { UserCaseInstance } from "../types/case";

interface UseCaseUnboxingProps {
  weaponPool: Weapon[];
  selectedInstanceId: number | null;
  refetchProfile: () => void;
  setUserCases: React.Dispatch<React.SetStateAction<UserCaseInstance[]>>;
}

export const useCaseUnboxing = ({
  weaponPool,
  selectedInstanceId,
  refetchProfile,
  setUserCases,
}: UseCaseUnboxingProps) => {
  // Visual states
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [unlocked, setUnlocked] = useState<Weapon | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [carouselWeapons, setCarouselWeapons] = useState<Weapon[]>([]);
  const [translateX, setTranslateX] = useState<number>(0);

  const carouselContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenCase = async () => {
    if (!selectedInstanceId) return;

    // Reset visual states immediately upon click
    setIsOpening(true);
    setShowWinner(false);
    setTranslateX(0);
    setCarouselWeapons([]);

    try {
      const response = await api.openCase(selectedInstanceId);

      const wonWeaponStats = weaponPool.find(
        (w) => w.name === response.weaponName,
      );

      const actualWinner: Weapon = {
        id: Date.now(), // Ephemeral ID for UI rendering
        name: response.weaponName,
        type: wonWeaponStats?.type ?? "WEAPON",
        side: wonWeaponStats?.side ?? "ALL",
        energyCost: wonWeaponStats?.energyCost ?? 0,
        damage: wonWeaponStats?.damage ?? 0,
        drawWeight: wonWeaponStats?.drawWeight ?? 0,
        critChance: wonWeaponStats?.critChance ?? 0,
        critMultiplier: wonWeaponStats?.critMultiplier ?? 1.0,
        statusEffect: wonWeaponStats?.statusEffect ?? "NONE",
        rarity: response.rarity as any,
        imageUrl: response.imageUrl,
        description: wonWeaponStats?.description ?? "Case drop",
      };

      const CAROUSEL_STOP_INDEX = 45;
      const TOTAL_CAROUSEL_ITEMS = 50;
      const track: Weapon[] = [];

      for (let i = 0; i < TOTAL_CAROUSEL_ITEMS; i++) {
        if (i === CAROUSEL_STOP_INDEX) {
          track.push({ ...actualWinner, uniqueId: `winner-${i}` });
        } else {
          const randomItem =
            weaponPool.length > 0
              ? weaponPool[Math.floor(Math.random() * weaponPool.length)]
              : actualWinner; // Safe fallback

          track.push({
            ...randomItem,
            uniqueId: `filler-${i}-${Math.random()}`,
          });
        }
      }

      setCarouselWeapons(track);
      setUnlocked(actualWinner);

      setTimeout(() => {
        if (carouselContainerRef.current) {
          const containerWidth = carouselContainerRef.current.offsetWidth;
          const cardWidthWithGap = 200;
          const targetX =
            CAROUSEL_STOP_INDEX * cardWidthWithGap -
            (containerWidth / 2 - cardWidthWithGap / 2);

          const jitter = Math.floor(Math.random() * 160) - 80;
          setTranslateX(-(targetX + jitter));
        }
      }, 50);
    } catch (error) {
      console.error("Unboxing error:", error);
      setIsOpening(false);
    }
  };

  const resetView = () => {
    setIsOpening(false);
    setShowWinner(false);
    setUnlocked(null);
    setTranslateX(0);
    setCarouselWeapons([]);
  };

  const handleConfirmReward = (onClose: () => void) => {
    invalidateProfileCache();
    refetchProfile();
    setUserCases((prev) => prev.filter((c) => c.id !== selectedInstanceId));
    resetView();
    onClose();
  };

  return {
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
  };
};
