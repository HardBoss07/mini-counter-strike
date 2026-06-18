# Weapons

## 1. Utility Items (The Status Modifiers)

Utility items alter the `MatchState` for the following turns.

| Name              | Cost | Dmg | Draw Wt. | Side | Status Effect String                                                         |
| ----------------- | ---- | --- | -------- | ---- | ---------------------------------------------------------------------------- |
| **HE Grenade**    | 2    | 15  | 50       | ALL  | `NONE`                                                                       |
| **Flashbang**     | 1    | 0   | 60       | ALL  | `BLIND_50` _(Next enemy weapon deals 50% dmg)_                               |
| **Smoke Grenade** | 2    | 0   | 40       | ALL  | `SKIP_TURN` _(Enemy hand discarded next turn)_                               |
| **Molotov**       | 3    | 10  | 30       | ALL  | `BURN_15` _(Enemy takes 15 unmitigable dmg at the start of their next turn)_ |

_Architectural Note for Molotov:_ In your `CombatRoundRecord`, when the Molotov is played, apply the `BURN_15` status to the opponent. At the beginning of the opponent's next turn, your `MatchEngine.java` should check for this status, instantly subtract 15 HP, and then clear the status.

## 2. The Weapon Armory

Balanced for a 100 HP, 10 Energy Max meta.

**Pistols**
Reliable, cheap, and almost always in your hand.

| Name             | Cost | Dmg | Draw Wt. | Crit Chance | Crit Mult. | Side | Notes                                                      |
| ---------------- | ---- | --- | -------- | ----------- | ---------- | ---- | ---------------------------------------------------------- |
| **Glock-18**     | 2    | 12  | 80       | 10%         | 1.5x       | T    | Highly common, low impact.                                 |
| **USP-S**        | 2    | 15  | 80       | 15%         | 1.5x       | CT   | Slightly higher base damage and precision.                 |
| **Desert Eagle** | 3    | 25  | 45       | 25%         | 2.0x       | ALL  | Heavier cost, lower draw, but 25% chance to hit for 50 HP. |

**SMGs**
Low damage per hit, but they flood your hand, ensuring you almost always have an attack to spend your spare 2 Energy on.

| Name       | Cost | Dmg | Draw Wt. | Crit Chance | Crit Mult. | Side | Notes                                              |
| ---------- | ---- | --- | -------- | ----------- | ---------- | ---- | -------------------------------------------------- |
| **MAC-10** | 2    | 10  | 90       | 5%          | 1.5x       | T    | Most common draw in the game.                      |
| **MP9**    | 2    | 11  | 85       | 5%          | 1.5x       | CT   | Slightly less common than MAC-10.                  |
| **MP7**    | 3    | 14  | 75       | 10%         | 1.5x       | ALL  | Better stats, but competes with rifles for Energy. |

**Rifles**
The core damage dealers.

| Name         | Cost | Dmg | Draw Wt. | Crit Chance | Crit Mult. | Side | Notes                                                  |
| ------------ | ---- | --- | -------- | ----------- | ---------- | ---- | ------------------------------------------------------ |
| **Galil AR** | 4    | 24  | 65       | 10%         | 1.5x       | T    | Cheap T-side rifle.                                    |
| **FAMAS**    | 4    | 22  | 65       | 10%         | 1.5x       | CT   | Cheap CT-side rifle.                                   |
| **AK-47**    | 5    | 35  | 50       | 20%         | 2.0x       | T    | Highly lethal. A crit deals 70 HP.                     |
| **M4A4**     | 5    | 30  | 60       | 10%         | 1.5x       | CT   | More common than the AK, consistent damage.            |
| **M4A1-S**   | 5    | 30  | 50       | 20%         | 1.5x       | CT   | Matches M4A4 damage, rarer draw, but crits more often. |

**Snipers**
High risk, high reward.

| Name       | Cost | Dmg | Draw Wt. | Crit Chance | Crit Mult. | Side | Notes                                                       |
| ---------- | ---- | --- | -------- | ----------- | ---------- | ---- | ----------------------------------------------------------- |
| **SSG 08** | 4    | 20  | 35       | 40%         | 2.0x       | ALL  | The Wildcard. 40% chance to hit for 40 HP.                  |
| **AWP**    | 8    | 80  | 15       | 10%         | 1.5x       | ALL  | Requires nearly full Energy. 10% chance to 1-shot (120 HP). |
