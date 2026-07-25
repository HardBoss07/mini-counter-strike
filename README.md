# Mini Counter Strike

This is a Counter Strike inspired turn-based card game. Designed as an asynchronous, turn-based tactical deckbuilder, the game focuses on loadout optimization and strategic combat.

## Core Gameplay

- **Objective:** The win condition is to deplete the opponent's 100 HP before they deplete yours.
- **The Loop:** Players configure a 5-item loadout, queue for 1v1 asynchronous matches, earn cases via time-based drops, and unbox weapons with unique stat modifiers to optimize their loadouts.
- **Energy System:** Standard economic purchasing is replaced by a turn-based Energy System where players spend generated energy to play cards in their hand.
- **Match Flow:** A single match consists of up to two playable rounds. Round 1 pits Player A's T-Side Loadout against Player B's CT-Side Loadout, and Round 2 forces a side swap. A deterministic "Turn Efficiency" tie-breaker is used if the match score is 1-1.
