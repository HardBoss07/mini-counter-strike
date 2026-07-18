import { useMemo } from "react";
import { parseHp } from "../types/match";

export const useMatchStats = (matchState: any, viewerUsername: string) => {
  return useMemo(() => {
    // Provide safe defaults if state hasn't loaded yet
    const hpA = parseHp(matchState?.playerAStatus ?? "HP:100");
    const hpB = parseHp(matchState?.playerBStatus ?? "HP:100");
    const isCompleted = matchState?.status === "COMPLETED";

    const playerAUser = matchState?.playerAUsername ?? "Player A";
    const playerBUser = matchState?.playerBUsername ?? "Player B";

    const isUserPlayerA =
      viewerUsername.length > 0 &&
      playerAUser.toLowerCase() === viewerUsername.toLowerCase();

    const labelA = isUserPlayerA
      ? `${playerAUser} (You)`
      : `${playerAUser} (Opponent)`;
    const labelB = !isUserPlayerA
      ? `${playerBUser} (You)`
      : `${playerBUser} (Opponent)`;

    const viewerHp = isUserPlayerA ? hpA : hpB;
    const opponentHp = isUserPlayerA ? hpB : hpA;

    return {
      hpA,
      hpB,
      isCompleted,
      isUserPlayerA,
      labelA,
      labelB,
      viewerHp,
      opponentHp,
    };
  }, [matchState, viewerUsername]);
};
