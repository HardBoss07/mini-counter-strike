# Mini Counter Strike

This is a Counter Strike inspired turn-based card game. Designed as an asynchronous, turn-based tactical deckbuilder, the game focuses on loadout optimization and strategic combat.

## Core Gameplay

- **Objective:** The win condition is to deplete the opponent's 100 HP before they deplete yours.
- **The Loop:** Players configure a 5-item loadout, queue for 1v1 asynchronous matches, earn cases via time-based drops, and unbox weapons with unique stat modifiers to optimize their loadouts.
- **Energy System:** Standard economic purchasing is replaced by a turn-based Energy System where players spend generated energy to play cards in their hand.
- **Match Flow:** A single match consists of up to two playable rounds. Round 1 pits Player A's T-Side Loadout against Player B's CT-Side Loadout, and Round 2 forces a side swap. A deterministic "Turn Efficiency" tie-breaker is used if the match score is 1-1.

## Loadouts and Armory

- **Strict Loadouts:** Every player maintains two separate loadouts in their database profile: a T-Side Loadout and a CT-Side Loadout. A valid loadout must contain exactly 5 items: 3 Weapons and 2 Utility Items.
- **Draw Weight:** At the start of each turn, the backend randomly selects exactly 3 items from the 5-item loadout to form the player's hand. The probability of an item being drawn is determined by a hidden integer value called Draw Weight.
- **Weapons:** Players utilize Pistols, SMGs, Rifles, and Snipers.
- **Utility:** Utility items alter the match state for the following turns. Examples include Flashbangs (blinds enemies), Smoke Grenades (skips enemy turn), and Molotovs (applies burn damage).

## Progression & Economy

- **Cases:** A Spring Boot scheduled task distributes 1 Weapon Case to every active user's inventory every 1 hours, only if the previous Case has been opened.
- **Modifiers:** Unboxed weapons feature distinct skins that alter base stats, such as reducing energy cost or increasing draw weight.
- **ELO System:** Players start out with a flat 1000 ELO and gain or lose a static 25 ELO based on match outcomes.

## Technical Architecture

The architecture supports the complete game loop from registration, to inventory management, case unboxing, and the turn-based combat engine.

### Backend

- **Stack:** Built with Java 21 and Spring Boot.
- **Engine:** Utilizes a dedicated `MatchEngine.java` service to run a deterministic simulation loop when an attack is initiated, saving the sequence of events to the database.
- **State:** Uses Java 21 record classes for immutable data transfer, such as the `CombatRoundRecord`.

### Frontend

- **Stack:** React Single Page Application (SPA) built with Vite.
- **UI Architecture:** Implements strict Atomic Design principles to manage the complexity of the match viewer.
- **Playback:** The React frontend receives the full JSON array of turns from the backend and acts purely as a "replay viewer," stepping through the array with a 1-second delay between turns.
- **Package Management:** Uses `npm` to keep the dependency tree lean.
