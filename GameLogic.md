# Game Design Document: "Tactical Strike" (Mini-CS Turn-Based Battler)

## 1. Game Overview

**Genre:** Asynchronous, Turn-Based Tactical Deckbuilder.
**Core Loop:** Players configure a 5-item loadout, queue for 1v1 asynchronous matches, earn cases via time-based drops, and unbox weapons with unique stat modifiers to optimize their loadouts.
**Win Condition:** Deplete the opponent's 100 HP before they deplete yours.

---

## 2. The Loadout Mechanics (The "Deck")

Every player maintains two separate loadouts in their database profile: a **T-Side Loadout** and a **CT-Side Loadout**.

A valid loadout must contain exactly 5 items:

- **3 Weapons:** The primary damage dealers.
- **2 Utility Items:** Tactical modifiers.

### The "Draw Weight" System (Pull Out Speed)

Players do not have access to all 5 items every turn. Instead, at the start of each turn, the backend randomly selects exactly **3 items** from the 5-item loadout to form the player's "Hand".

- **Draw Weight:** A hidden integer value assigned to every item determining its probability of being drawn.
- **Heavy Weapons (e.g., AWP):** High damage, but a _low draw weight_ (e.g., 10). It might take 3 turns before the AWP finally appears in your hand.
- **Sidearms (e.g., Glock):** Low damage, but a _high draw weight_ (e.g., 80). It will almost always be available to use.

---

## 3. Battle Mechanics & Energy System

Standard economic purchasing is replaced by a Turn-Based **Energy System**.

- **Starting State:** Both players start with 100 HP and 0 Energy.
- **Energy Regeneration:** At the start of Turn 1, players receive 2 Energy. On Turn 2, they receive 3 Energy, scaling up to a maximum cap (e.g., 10 Energy). Energy carries over between turns if unspent.

### Item Archetypes & Costs

Players spend Energy to play the cards in their hand.

- **Weapons:**
- _SMG (Cost: 2 Energy):_ 15 Damage. Moderate draw weight.
- _AK-47 (Cost: 4 Energy):_ 35 Damage. Normal draw weight.
- _AWP (Cost: 7 Energy):_ 85 Damage. Very low draw weight.

- **Utility (Status Effects):**
- _Flashbang (Cost: 1 Energy):_ Applies the `Blinded` status to the opponent. The opponent's next weapon attack deals -50% damage.
- _Smoke Grenade (Cost: 2 Energy):_ Applies the `Blocked` status. The opponent's next drawn hand is discarded, forcing them to skip a turn (though they still regenerate energy).
- _HE Grenade (Cost: 2 Energy):_ Direct unmitigable 15 damage.

---

## 4. Match Flow: The Best-of-3 & Tie-Breaker

To simulate the competitive nature of CS, a single match consists of up to two playable rounds, utilizing a deterministic tie-breaker to avoid complex 3rd-round UI states.

### Round Handling

- **Round 1:** Player A uses their T-Side Loadout. Player B uses their CT-Side Loadout. The server calculates the turns until one player reaches 0 HP.
- **Round 2:** The backend automatically forces a side swap. Player A uses their CT-Side Loadout. Player B uses their T-Side Loadout.

### The "Turn Efficiency" Tie-Breaker

If the match score is 1-1 (meaning both players successfully won their CT half), the backend resolves the winner instantly without requiring a 3rd round.

- **The Logic:** The backend queries the `MatchState` logs to determine who won their CT half in the _fewest number of turns_.
- **Example:** If Player A won their CT half in 5 turns, but Player B took 8 turns to win theirs, Player A is declared the match winner. This heavily penalizes players who just spam Smoke Grenades to stall, forcing them to build lethal, efficient loadouts.

---

## 5. Progression: Cases & Modifiers (The Cronjob Economy)

Players progress by unlocking new variants of weapons to replace their base items.

- **The Drop System:** A Spring Boot `@Scheduled` task runs in the background, distributing 1 "Weapon Case" to every active user's inventory every 4 hours.
- **Unboxing:** When a user opens a case via the frontend, the backend generates a specific `UserWeaponInstance`.
- **Skins & Modifiers:** Unboxed weapons have distinct skins that alter base stats.
- _Base AK-47:_ 35 Damage, 4 Cost, Normal Draw Weight.
- _AK-47 | Redline (Rare):_ 35 Damage, **3 Cost**, Normal Draw Weight.
- _AK-47 | Vulcan (Epic):_ **40 Damage**, 4 Cost, Normal Draw Weight.
- _AK-47 | Asiimov (Legendary):_ 35 Damage, 4 Cost, **+15% Draw Weight (Pull out speed)**.

---

## 6. Technical Architecture Blueprint

### Java 21 Backend (Spring Boot)

- **Data Models (Entities):** \* `WeaponTemplate` (The base catalog of items).
- `UserWeaponInstance` (The specific items owned by a user, containing their unique modifiers).
- `Loadout` (A join table linking a User to 5 `UserWeaponInstance` IDs).

- **State DTOs:** Utilize Java 21 `record` classes for immutable data transfer. `CombatRoundRecord` will contain the turn number, HP values, Energy, and a string log of actions (e.g., _"Player A threw a Flashbang. Player B is Blinded!"_).
- **Game Engine:** A dedicated `MatchEngine.java` service. Because the game is asynchronous, when Player A initiates an attack, the engine pulls Player B's CT Loadout from the database and runs a deterministic simulation loop (while-loop until an HP hits 0), saving the sequence of events to the database.

### Frontend (React)

- **Package Management:** Use `npm` to keep the dependency tree lean, especially as the project scales to handle complex animations or state management libraries.
- **UI Structure:** Implement strict Atomic Design principles to manage the complexity of the match viewer.
- _Atoms:_ `WeaponStatBadge`, `HealthBar`, `EnergyCoin`.
- _Molecules:_ `InventoryCard` (combines the item image, stats, and equip button).
- _Organisms:_ `LoadoutBuilder` (manages the drag-and-drop of 5 molecules), `CombatLogRenderer` (parses the JSON array from the backend and renders the turn-by-turn text or animations).

- **Match Playback:** When a match finishes calculating on the backend, the React frontend receives the full JSON array of turns. The UI then acts purely as a "replay viewer," stepping through the `CombatRoundRecord` array with a 1-second delay between turns so the user can watch the battle unfold.
