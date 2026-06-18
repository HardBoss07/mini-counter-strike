# Project Features & Architecture

This document provides a deep architectural analysis of the WISS-TCG platform, detailing the implementation of its core features across the full stack.

## 1. Authentication & Security (JWT)

WISS-TCG implements a stateless authentication system using JSON Web Tokens (JWT), ensuring scalability and security without the need for server-side session storage.

### Backend Implementation

- **Stateless Configuration:** `SecurityConfig.java` configures Spring Security to use `SessionCreationPolicy.STATELESS`. This forces every request to be self-contained with its own authentication credentials.
- **JWT Filter:** `JwtAuthenticationFilter.java` is a custom filter that extends `OncePerRequestFilter`. It intercepts every incoming request, extracts the `Authorization: Bearer <token>` header, and validates the token using `JwtUtil`.
- **Token Validation:** `JwtUtil.java` uses the **io.jsonwebtoken (JJWT)** library (v0.12.3) with HMAC SHA-256 signing. It extracts the user's email and role claims to populate the `SecurityContextHolder`.
- **User Protection:** The filter also checks the `banned` status of the user in the database before authorizing the request, allowing for real-time moderation.

### Frontend Implementation

- **Auth Context:** `AuthContext.jsx` acts as the single source of truth for authentication state. It manages the `authToken` in `localStorage` and provides hooks like `login`, `logout`, and `isAuthenticated`.
- **Route Guards:** `ProtectedRoute.jsx` is a higher-order component that wraps sensitive views. It checks the `AuthContext` and optionally verifies user roles (e.g., `ADMIN`) before rendering children or redirecting to `/login`.

---

## 2. Multi-User & Real-Time Matchmaking

The matchmaking system is built around a "Room" architecture, allowing players to create lobbies and join others for battles.

### Room Lifecycle (`RoomService.java`)

- **ID Recycling:** A specialized algorithm (`getLowestFreeId`) finds the smallest available integer ID for new rooms. This keeps the URL structure clean and recycles slots from deleted rooms.
- **Creator Migration:** If the room creator leaves before a match starts, the system automatically promotes the remaining player to creator status to prevent "orphaned" rooms.
- **Auto-Destruction:** Rooms are automatically deleted from the database when the last player leaves.

### Match Preparation

- When a match is started via `RoomController.startMatch`, the system transitions from a "lobby" state to a "battle" state.
- **Match Snapshots:** The system creates `MatchCard` entities. Unlike the user's permanent collection, these are snapshots containing `currentHp` and `isActive` flags, allowing combat damage to persist throughout a match without affecting the player's base cards.

---

## 3. Scheduled Tasks & Cronjobs

WISS-TCG uses background processing to create a passive progression system for players.

### Automated Pack Distribution

- **PackSchedulerService.java:** Utilizes Spring's `@Scheduled` annotation with a `fixedRate` of 300,000ms (5 minutes).
- **Logic:** Every 5 minutes, the service performs a batch check of all users. If a user's `timeToNewPack` timestamp is in the past, they are granted 1 pack, and their next distribution time is calculated and persisted.
- **Transactional Integrity:** The entire distribution cycle is wrapped in a `@Transactional` block to ensure that user data remains consistent even if the process is interrupted.

---

## 4. Game Engine & State Management

The core gameplay is handled by a deterministic engine that resolves combat rounds based on card statistics.

### Combat Logic (`GameEngine.java`)

- **Simultaneous Combat:** Both cards attack each other at the same time. Damage is calculated as `max(1, Attacker_ATK - Defender_DEF)`.
- **Sequential Resolution:** Cards fight in the order they were placed in the deck (positions 0-4).
- **Stat Persistence:** HP reduction is recorded in the `MatchCard` entity, ensuring the state is preserved between API calls.

### State Synchronization

- **MatchStateDto.java:** This DTO provides a comprehensive snapshot of the match, including remaining card counts for both players and the currently active battling cards.
- **Polling Architecture:**
  - The **Host (Creator)** is responsible for driving the game forward by calling the `/round` endpoint every few seconds.
  - The **Player** polls the `/match/{id}` endpoint to receive the latest `MatchStateDto` and update their local React state.

---

## 5. Database & Entity Relationships

The system uses **MySQL 8.0** with JPA/Hibernate for object-relational mapping.

### Core Entities

- **User:** Stores profile info, credentials (BCrypt), and passive progression state.
- **Card:** A static "Master Catalog" of all available cards.
- **Deck & DeckCard:** A Many-to-Many relationship using a bridge entity (`DeckCard`) to store the specific `position` (0-4) of a card within a deck.
- **Match & MatchCard:** Tracks active sessions. `MatchCard` is the operational entity that stores the dynamic HP of cards during a fight.

### Data Seeding

- **data.sql:** Populates the card catalog on startup using `INSERT IGNORE`.
- **DataInitializer.java:** A `CommandLineRunner` that programmatically creates default `ADMIN` and `USER` accounts and ensures the initial card distribution for test users.

---

## 6. Admin & Role-Based Access Control (RBAC)

The platform provides a dedicated administrative interface for game moderation and catalog management.

### Access Control

- **Backend Enforce:** `AdminController.java` is annotated with `@PreAuthorize("hasRole('ADMIN')")`. This ensures that even if a user bypassed the frontend, the API would reject their requests at the Spring Security level.
- **Role Hierarchy:** Roles are defined in `UserRole.java` as `ROLE_ADMIN` and `ROLE_USER`.

### Administrative Capabilities

- **Moderation:** Admins can ban users (preventing login via the `JwtAuthenticationFilter` check), promote others to admin, or reset passwords.
- **Economy Control:** Admins can grant specific amounts of packs to users.
- **Catalog Management:** The `AdminPanel.jsx` allows for creating and updating cards, including a multi-part form for **Image Uploads** which are served dynamically by the backend.

---

## 7. Documentation Overview

The project maintains extensive documentation in the `/docs` directory to assist developers:

- **API_ENDPOINTS.md:** A comprehensive list of all 31 REST endpoints, including request/response schemas and required permissions.
- **ERD (erd.png):** Visualizes the complex relationships between users, collections, decks, and matches.
- **Flow Diagrams:** Detailed visualizations of the **JWT Auth Flow**, **State Management Flow**, and **Layer Architecture**.
- **ROLES_SETUP.md:** Specific instructions on how the system distinguishes between user permissions.
