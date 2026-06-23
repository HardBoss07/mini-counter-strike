# Handoff

## Goal

Enforce a tactical loadout restriction rule where players can only equip a maximum of **one unique weapon base type** (e.g., only 1 AK-47, regardless of whether it is Slate, Redline, or Gold Arabesque) in their active 5-item loadout. Additionally, resolve match engine mechanics bugs regarding utility/grenade actions not passing turns and individual card hands scrambling sequence orders on every action submission.

## Current State

- **Loadout Validation:** Frontend validation (`LoadoutBuilderView.tsx`) blocks the user from dragging duplicate base variants into an active slot, and full backend protection has been integrated into `LoadoutServiceImpl.java` to extract base prefixes (`split(" \\| ")[0]`) and reject duplicate API requests.
- **HTTP Void Payloads:** Handled empty response syntax errors globally inside the frontend client wrapper (`api.ts`), ensuring successful textless void updates return clear fallback structures without throwing an `Unexpected end of JSON input` crash.
- **Exception Interception:** Appended an localized `@ExceptionHandler` inside `MatchController.java` to prevent Spring Security configuration states from intercepting match engine business exceptions and turning them into generic `403 Forbidden` statuses.

## Files Actively Involved

- `frontend/src/views/LoadoutBuilderView.tsx` — Handles drag-and-drop constraints.
- `frontend/src/utils/api.ts` — Controls API network stream parsing safely.
- `backend/src/main/java/dev/m4tt3o/minics/service/LoadoutServiceImpl.java` — Persists validation layers across saving routines.
- `backend/src/main/java/dev/m4tt3o/minics/controller/MatchController.java` — Serves combat action endpoints.
- `backend/src/main/java/dev/m4tt3o/minics/engine/MatchEngine.java` — Simulates combat damage values and draws.
- `backend/src/main/java/dev/m4tt3o/minics/service/MatchServiceImpl.java` — Coordinates match state lifecycles and stores turn data.

## Investigation History & Learnings

1. **Model Persistence Realization:** The `Match.java` database entity handles state values purely by serializing data into a singular database column framework text layout field named `logsJson` mapped through `LiveMatchState` wrappers. It does _not_ expose native JPA flat schema columns like `currentTurnPlayerId`, `round`, or `playerAStateJson` directly.
2. **Turn Advancement Failure:** Grenades (`ItemType.UTILITY`) were stalling state workflows because the engine validation pipeline checked exclusively for `ItemType.WEAPON` before executing damage parameters and advancing turn markers.
3. **Hand Reshuffling Root Cause:** The full hand randomized layout issue was traced back to the service layer regenerating a whole new 3-card hand frame using `matchEngine.drawHand(loadoutPool)` upon every turn, rather than performing an in-place array swap replacing only the single card that was spent.

## Next Steps

1. Open **`MatchEngine.java`** and inspect the `resolveTurn` method. Ensure that actions containing an `ItemType.UTILITY` are evaluated, extract any structural status effects or weapon damage configurations mapped through `data.sql`, and pass the generated values into the `CombatRoundRecord`.
2. Open **`MatchServiceImpl.java`** and look at how `submitAction` packs changes into `logsJson`. Modify the draw logic so it doesn't pass the full loadout back to the engine. Instead, copy the current player's existing hand, drop the item matching the played `weaponId`, isolate what cards remain in the 5-item list, draw exactly **one** item to fill the gap via `matchEngine.selectByWeight(remainingPool)`, and serialize the results back into your database record structure.
