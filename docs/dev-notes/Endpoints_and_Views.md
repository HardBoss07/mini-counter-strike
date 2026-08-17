Here is the comprehensive architectural blueprint for the Mini-CS REST API and the corresponding React Single Page Application (SPA) views. This structure supports the complete game loop from registration, to inventory management, case unboxing, and the turn-based combat engine.

### 1. Backend API Endpoints (Spring Boot)

All endpoints (except auth) expect an `Authorization: Bearer <jwt>` header.

**Authentication & User Profile (`/api/auth` & `/api/user`)**

- `POST /api/auth/register`: Creates a new user account, hashes the password, and provisions the default 5-item T and CT loadouts. Returns a JWT.
- `POST /api/auth/login`: Authenticates credentials and returns a JWT containing the user ID and username.
- `GET /api/user/me`: Retrieves the current user's profile data, including their current Elo, available Credits/Keys, and un-opened Weapon Cases.

**Inventory & Loadout Management (`/api/inventory`)**

- `GET /api/inventory/weapons`: Fetches the user's specific collection of `UserWeaponInstance` records (including any custom skin modifiers like reduced energy cost or increased draw weight).
- `GET /api/inventory/loadouts`: Retrieves the currently equipped T-Side and CT-Side loadouts (the 5 active item IDs for each).
- `POST /api/inventory/loadouts/save`: Accepts two arrays of 5 item IDs. Validates side restrictions (e.g., no AK-47 on CT side) and updates the junction tables.

**The Economy & Progression (`/api/economy`)**

- `POST /api/economy/cases/open`: Consumes 1 Case from the user's profile. The backend runs the RNG drop logic against the `weapon_template` table, creates a new `UserWeaponInstance` with assigned skin modifiers, saves it to the database, and returns the new item to the frontend for the unboxing animation.

**Matchmaking & Combat Engine (`/api/match`)**

- `POST /api/match/queue`: Enters the user into the matchmaking pool. Returns a `ticketId`.
- `GET /api/match/queue/status`: Polled by the frontend every few seconds to check if an opponent was found. Returns a `matchId` when ready.
- `GET /api/match/{matchId}/state`: Retrieves the current `PlayerState` for both users (HP, Energy, active Status Effects like `BLIND_50`), the current Round Number, and the 3 specific items drawn for the player's current hand.
- `POST /api/match/{matchId}/action`: Submits the user's turn. Accepts the ID of the weapon/utility used. The backend calculates critical hits, applies status effects, updates HP, and advances the turn counter.
- `GET /api/match/{matchId}/logs`: Retrieves the array of `CombatRoundRecord` strings (e.g., _"Player A threw a Flashbang. Player B is Blinded!"_) so the frontend can animate the history.

**Social (`/api/leaderboard`)**

- `GET /api/leaderboard`: Fetches the top 50 users sorted by Elo in descending order.

---

### 2. Frontend SPA Views (React / Vite)

These views will be managed by a routing library like `react-router-dom`, utilizing the Atomic Design components you have started building.

**Public Routes**

- **`/login` & `/register**`: Standard authentication forms. The register view handles the initial JWT storage and redirects to the Dashboard.

**Main Navigation (Protected Routes)**

- **`/` (Dashboard / Command Center)**: The main hub. Displays the user's current rank/Elo badge, a summary of recent match outcomes, and a prominent "Find Match" button.
- **`/loadout`**: The Drag-and-Drop Loadout Builder. Features the Armory grid of owned weapons and the strict 5-slot T and CT dropzones.
- **`/inventory`**: A gallery view of the user's entire weapon collection. Clicking a weapon card flips it over to show its specific lore, stats, and critical hit multipliers.
- **`/cases`**: The unboxing view. Displays a visual counter of owned cases. Clicking "Open" triggers a CSS/Framer Motion roulette animation, culminating in the display of the data returned from the `/api/economy/cases/open` endpoint.
- **`/leaderboard`**: A clean, tabular view of the top-ranked players globally.

**Gameplay Loop Views**

- **`/matchmaking`**: A transitional view displayed after clicking "Find Match". Shows a radar scanning animation or a timer while polling the `/queue/status` endpoint.
- **`/battle/:matchId`**: The core game arena.
- **Top Half:** Opponent's status (Health Bar, generic card backs representing their hand).
- **Middle:** The combat log scrolling text or visual effect arena.
- **Bottom Half:** The player's HUD (Health Bar, Energy Coin counter, and the 3 draggable/clickable weapon cards drawn for the current turn).

- **`/battle/:matchId/results`**: The post-match summary screen. Displays "Terrorists Win" or "Counter-Terrorists Win," the Elo gained or lost, and the "Turn Efficiency" metric used in the event of a tie-breaker.
