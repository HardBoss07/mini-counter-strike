# Handoff

## Goal
Establish a functional authentication and weapon catalog system for Mini Counter-Strike, ensuring the Vite frontend can communicate seamlessly with the Spring Boot backend via a Dockerized network.

## Current State
- **Docker Infrastructure:** All services (`minics-db`, `minics-backend`, `minics-frontend`) are healthy and running.
- **Backend:** Successfully compiled and stabilized. The Spring Boot application starts without crashes and connects to the PostgreSQL database.
- **Frontend:** Vite dev server is running and successfully proxying requests to the backend service.
- **Blocker:** Requests to `/api/auth/register` are returning a `403 Forbidden` error. This indicates that while the network path is open (no more 502s), the Spring Security configuration is rejecting the request.

## Files Actively Involved
- `backend/src/main/java/dev/m4tt3o/mini_cs/config/SecurityConfig.java`: Manages API access rules.
- `backend/src/main/java/dev/m4tt3o/mini_cs/controller/AuthController.java`: Handles registration logic.
- `frontend/src/utils/api.ts`: Orchestrates frontend API calls.
- `backend/src/main/resources/schema.sql`: Defines the database structure.

## Investigation History & Learnings
- **Resolved 502 Errors:** Previously, the backend was crashing because `schema.sql` lacked `IF NOT EXISTS` clauses, causing failures on database restarts.
- **Refactored Loadout Entity:** Aligned the JPA model with the 3NF junction table defined in the SQL schema.
- **JWT Modernization:** Updated the `JwtUtil` to comply with the JJWT 0.12.5 API (using `parser()` and `verifyWith()`).
- **Networking Learning:** The Vite proxy must target `http://backend:8080` (service name) rather than `localhost` to function within the Docker bridge network.

## Next Steps
1. **Audit SecurityConfig:** Investigate why `/api/auth/register` is returning 403. Ensure the `requestMatchers` correctly permit all traffic to the auth endpoints.
2. **Verify Auth Controller:** Check if the registration endpoint is properly mapped to `/api/auth/register` and not conflicting with other filters.
3. **Database Population:** Once 403s are resolved, verify that `data.sql` (if present) or manual registration correctly populates the `app_user` table to test login and loadout assignment.
