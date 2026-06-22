# Handoff

## Goal

Build a high-performance, responsive turn-based strategic card encounter arena modeled after tactical elements of Counter-Strike. The core architecture uses a Spring Boot (Java 21) backend that manages state validation and persists data via serialized JSON payloads, paired with a snappy, highly responsive React (Vite/TypeScript) custom frontend dashboard.

## Current State

- **Matchmaking Synchronicity:** The polling interval on the frontend matchmaking queue view was reduced to 500ms. Players now transition out of matchmaking efficiently and nearly simultaneously.
- **Persistent Hand State:** Hand card states are frozen and managed securely in the database layer inside a serialized `LiveMatchState` blob rather than recalculating on every view update, eliminating card layout shuffling during polling.
- **UI Calibration:** Context identification variables now dynamically differentiate players, showing authentic end-of-round performance statistics and perspective-correct Winner/Loser dashboards.
- **Active Blocking Bugs:** 1. **Split-Match Split (Ghost Copies):** When two completed players immediately re-queue together, they are being split into isolated match instances (e.g., Battle ID 2 and Battle ID 3), playing against stale "ghost" components of each other. 2. **Session Disconnection:** Graceful termination via tab closing (`beforeunload` + `navigator.sendBeacon`) is partially non-functional due to security sandboxing or missing backend route alignments, leaving ghost sessions active on abrupt tab dismissal.

## Files Actively Involved

- `backend/.../service/MatchServiceImpl.java` — Controls match initiation, side allocation randomization, static hand draws, performance metrics extraction, and action resolution.
- `backend/.../controller/MatchController.java` — Securely exposes action submission, tactical state polling, and surrender endpoints.
- `backend/.../service/MatchmakingService.java` — State machine tracking the global user matching array queue and routing active match tickets.
- `frontend/.../views/MatchmakingView.tsx` — Manages high-frequency (500ms) matching verification loops.
- `frontend/.../views/BattleView.tsx` — Handles active combat tray inputs, state processing, and the post-game modal summary card.

## Investigation History & Learnings

- **The Ghost Match Split Cause:** When Player 1 and Player 2 finish a match and click "Queue Again," the frontend immediately places them back into `MatchmakingService`. If `MatchmakingService.tryMatchmaking()` is called sequentially while the previous ticket clearing logic (`ticketToMatch.remove(userId)`) runs too early or too late, the matchmaking loop registers the match criteria out of phase. The system pairs Player 1 with Player 2's _old/cached_ ticket state or spawns independent concurrent matches within the service's execution thread.
- **JSON Integrity over Mocking:** Shifting away from computational memory mocking to absolute state recording in database JSON resolved UI data desynchronization.
- **UI Crash Resilience:** Standardizing safe character string array splitters (e.g., verifying `.includes(':')` before processing split methods) prevents immediate frontend layout failures if the client queries the backend before a database save completes.

## Next Steps

1. **Refactor Matchmaking Thread Isolation:** Audit `MatchmakingService.java` to make sure `ticketToMatch` and `matchmakingQueue` are thread-safe and atomic during matchmaking updates. Ensure a user's previous session context is completely cleared from memory before `tryMatchmaking()` processes a new ticket.
2. **Review Disconnect Middleware:** Re-evaluate browser tracking. If `sendBeacon` continues to fail to pass Spring Security's CSRF/Auth validation during tab destruction, shift to a heartbeat monitor or an explicit WebSocket lifecycle listener to handle dirty client disconnects cleanly.
