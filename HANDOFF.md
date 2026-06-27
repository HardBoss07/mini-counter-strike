# Handoff

## Goal

Implement a seamless, turn-based battle engine that supports utility chaining (Smoke/Grenade combos) and persistent, asynchronous state updates via Server-Sent Events (SSE) while maintaining correct per-player deck consistency across round-based side swaps (T/CT).

## Current State

- **Networking:** Successfully migrated from manual `setInterval` polling to a persistent SSE stream (`subscribeToMatchStream` in `api.ts` and `BattleView.tsx`).
- **Engine Logic:** The `submitAction` logic has been updated to handle utility-based turn chaining (where grenades don't pass the turn) and the Smoke Grenade `SKIP_TURN` status (which now correctly bounces control back to the attacker).
- **Issues:** \* **Side Misalignment:** Players are intermittently receiving the incorrect loadout (e.g., getting T-side weapons when on CT-side) after the first action. This stems from a loss of context regarding the player's role in the specific match round within the `submitAction` replenishment block.
- **Hand Replenishment:** Previous attempts at restoring the 3-card hand draw failed to correctly resolve against the `LoadoutRepository` due to incorrect `side` resolution.
- **SSE Broadcast Contamination:** Initial implementations pushed identical state objects to all connected clients, resulting in players seeing their opponent's hand/state.

## Files Actively Involved

- `backend/src/main/java/dev/m4tt3o/minics/service/MatchServiceImpl.java`: The core orchestrator for turn execution, state persistence, and SSE broadcast routing.
- `backend/src/main/java/dev/m4tt3o/minics/dto/match/LiveMatchState.java`: Holds the serialized game state.
- `frontend/src/views/BattleView.tsx`: Manages the UI lifecycle and the SSE subscription.
- `frontend/src/utils/api.ts`: Houses the fetch-based SSE stream reader.

## Investigation History & Learnings

- **SSE Broadcasting:** Decoupling state generation from `SecurityContextHolder` is required for SSE; we must generate a `MatchStateResponse` per subscriber based on the `username` rather than the active authentication context.
- **Utility Chaining:** The `MatchEngine` does not need explicit chain-limiting logic because energy costs and hand size limits act as natural governors.
- **Side Persistence:** The `Match` entity's `round` and the `User`'s relationship to the match must be used to calculate `activeSide` explicitly during the hand-replenishment process, rather than assuming sides.

## Next Steps

1. **Refactor `submitAction` Replenishment:** Explicitly derive `activeSide` using `live.round()` and the player's match position to ensure the correct loadout is queried.
2. **Verify `mapToArchetype`:** Ensure the conversion from `WeaponTemplate` to `WeaponArchetype` in `MatchServiceImpl` preserves the `side` attribute, as this is the source of truth for the replenishment.
3. **SSE Routing Cleanup:** Finalize the broadcast loop in `submitAction` to ensure `getMatchStateForUser` is used for every subscriber to prevent state leakage.
