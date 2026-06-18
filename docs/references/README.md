# WISS-TCG

A full-stack trading card game platform with JWT-secured APIs, room-based matches, and a React frontend.

![Build Status](https://img.shields.io/badge/build-manual-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## Table of Contents

- [WISS-TCG](#wiss-tcg)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [User Stories](#user-stories)
    - [As a Player](#as-a-player)
    - [As an Administrator](#as-an-administrator)
  - [Tech Stack](#tech-stack)
  - [Architecture](#architecture)
  - [Layer Architecture Diagram](#layer-architecture-diagram)
  - [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
  - [Authentication Flow](#authentication-flow)
  - [State Management Flow](#state-management-flow)
  - [Frontend Component Architecture](#frontend-component-architecture)
    - [Route \& Component Hierarchy](#route--component-hierarchy)
    - [Component Reference](#component-reference)
    - [View Components (Pages)](#view-components-pages)
    - [Core Modules](#core-modules)
    - [Data Flow](#data-flow)
  - [Security Concept](#security-concept)
    - [Frontend Security](#frontend-security)
    - [Backend Security](#backend-security)
    - [Attack Surface \& Mitigations](#attack-surface--mitigations)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running the Project](#running-the-project)
  - [Project Structure](#project-structure)
  - [API Documentation](#api-documentation)
  - [Deployment](#deployment)
  - [Testing](#testing)
  - [License](#license)
  - [Authors](#authors)

## Overview

WISS-TCG is a web-based trading card game platform that combines player account management, card collection, deck building, room matchmaking, and battle simulation. It provides a clear full-stack baseline for building and extending a multiplayer TCG experience with role-based administration.

## Features

- JWT-based authentication and role-aware authorization (USER and ADMIN)
- Card catalog retrieval, card image serving, and admin image upload support
- Pack opening and player card collection tracking
- Deck creation and validation workflows
- Room creation, room joining, and match start lifecycle
- Match rounds, leaderboard, and match history endpoints
- Admin controls for card and user management

## User Stories

### As a Player

1. **Pack Opening & Collection**  
   _As a player, I want to open card packs and collect unique cards so that I can build a diverse card collection and discover new strategic options._

2. **Deck Building & Matchmaking**  
   _As a player, I want to create custom decks from my cards and challenge other players in real-time battles so that I can test my strategies and climb the leaderboard._

### As an Administrator

3. **Card & User Management**  
   _As an admin, I want to manage the card catalog (add/edit/delete cards) and moderate users (promote/ban/track activity) so that I can maintain game balance and community standards._

## Tech Stack

| Technology                            | Version                          | Usage                |
| ------------------------------------- | -------------------------------- | -------------------- |
| React                                 | 19.2.4                           | Frontend framework   |
| Spring Boot                           | 3.2.0                            | Backend framework    |
| MySQL (Docker image)                  | latest                           | Database             |
| Spring Security + JJWT                | Spring Security 6.x, JJWT 0.12.3 | Authentication       |
| React Context API + localStorage      | React built-in API               | State management     |
| Vite + Maven (container build stages) | Vite 8.0.4, Maven 3.9+           | Build tool / bundler |
| PowerShell script (`e2e_test.ps1`)    | PowerShell 5.1+ / 7+             | End-to-end testing   |
| Docker Compose                        | v2+                              | Deployment / hosting |

## Architecture

WISS-TCG follows a separated frontend/backend architecture with a React client, a Spring Boot REST API, and MySQL persistence. Authentication is JWT-based, and gameplay logic is exposed through dedicated room, deck, card, and match endpoints.

The frontend is built as a route-driven React application that calls backend endpoints through a shared Axios client. Authentication state is managed by an Auth context that stores the JWT token in local storage and fetches user profile data from `/api/users/me`.

The backend uses layered components (`controller`, `service`, `repository`, `entity`) with Spring Security for endpoint protection and role checks. Game operations such as opening packs, deck updates, room matchmaking, and combat rounds are handled through dedicated service classes, while MySQL stores users, cards, decks, and match data.

## Layer Architecture Diagram

![Layer Architecture](docs/layer_architecture.png)

## Entity Relationship Diagram (ERD)

![ERD](docs/erd.png)

## Authentication Flow

![JWT Authentication Flow](docs/jwtAuthFlow.png)

Authentication starts at `/api/auth/login` or `/api/auth/register`. On success, the backend returns a JWT token. The frontend saves this token as `authToken` in local storage, and the shared Axios client adds `Authorization: Bearer <token>` to protected requests.

For protected routes, Spring Security validates the JWT, resolves user authorities, and applies role checks for admin endpoints. If a request receives `401 Unauthorized`, the frontend interceptor clears the stored token and requires the user to sign in again.

## State Management Flow

![State Management Flow](docs/stateManagementFlow.png)

State management is centered around `AuthContext`. It provides `user`, `isAuthenticated`, `login`, `logout`, and `updateUserData` to the application. After login, `updateUserData` calls `/api/users/me` and stores the current user profile in context.

Views consume Auth context to decide what to render and whether a route should be protected. API data for cards, rooms, and matches is retrieved per view through the shared API client, keeping global state small and focused on authentication and session identity.

## Frontend Component Architecture

### Route & Component Hierarchy

```text
index.main (React DOM Root)
└── BrowserRouter
    └── AuthProvider
        └── Routes
            └── "/" (App Layout)
                ├── TopBar (persistent header)
                └── <Outlet> for nested routes
                    ├── "/" → Redirect (home → /packs)
                    ├── "/login" → Login
                    ├── "/register" → Register
                    ├── "/packs" → ProtectedRoute → Packs
                    │   └── Card (x multiple)
                    ├── "/collection" → ProtectedRoute → Collection
                    │   └── Card (x multiple)
                    ├── "/battle" → ProtectedRoute → RoomBrowser
                    │   └── RoomBrowserEntry (x multiple)
                    ├── "/room/:id" → ProtectedRoute → Room
                    │   └── PreMatchPlayer (x2 for both players)
                    ├── "/match/:id/:host" → ProtectedRoute → Match
                    │   └── BattlePlayer (x2 for active cards)
                    ├── "/admin" → ProtectedRoute(ADMIN) → AdminPanel
                    │   ├── AdminCardListEntry (x multiple)
                    │   └── AdminUserListEntry (x multiple)
                    └── "*" → 404 (Not Found)
```

### Component Reference

| Component              | Location      | Purpose                              | Parent Routes            |
| ---------------------- | ------------- | ------------------------------------ | ------------------------ |
| **TopBar**             | `components/` | Navigation, user profile, logout     | All (persistent)         |
| **ProtectedRoute**     | `components/` | Auth guard with optional role check  | All protected routes     |
| **Redirect**           | `components/` | Home page redirect logic             | "/"                      |
| **Card**               | `components/` | Card display (image, stats, actions) | Packs, Collection, Match |
| **RaritySelect**       | `components/` | Rarity filter/dropdown               | Collection, AdminPanel   |
| **RoomBrowserEntry**   | `components/` | Room listing item (players, status)  | RoomBrowser              |
| **PreMatchPlayer**     | `components/` | Player deck preview before match     | Room                     |
| **BattlePlayer**       | `components/` | Active card display during combat    | Match                    |
| **AdminCardListEntry** | `components/` | Card management row (edit/delete)    | AdminPanel               |
| **AdminUserListEntry** | `components/` | User management row (promote/ban)    | AdminPanel               |

### View Components (Pages)

| View            | Route              | Auth Required | Purpose                                   |
| --------------- | ------------------ | ------------- | ----------------------------------------- |
| **Login**       | `/login`           | No            | User authentication                       |
| **Register**    | `/register`        | No            | New account creation                      |
| **Redirect**    | `/`                | Yes           | Default redirect to packs                 |
| **Packs**       | `/packs`           | Yes           | Card pack opening, pull new cards         |
| **Collection**  | `/collection`      | Yes           | View owned cards, filter by rarity/search |
| **RoomBrowser** | `/battle`          | Yes           | Browse open match rooms                   |
| **Room**        | `/room/:id`        | Yes           | Wait for opponent, view deck preview      |
| **Match**       | `/match/:id/:host` | Yes           | Combat view, execute rounds, battle log   |
| **AdminPanel**  | `/admin`           | ADMIN         | Manage cards, users, moderation           |
| **404**         | `*`                | No            | Not found error page                      |

### Core Modules

| Module          | Responsibility                    | Key Exports                               |
| --------------- | --------------------------------- | ----------------------------------------- |
| **AuthContext** | Global authentication state       | useAuth hook, AuthProvider component      |
| **api.js**      | Axios client with JWT interceptor | apiClient, auth endpoints, data endpoints |
| **date.js**     | Date formatting utilities         | formatDate, formatTime functions          |

### Data Flow

1. User logs in via `/login` → `AuthContext.login()` → token stored in localStorage
2. Axios interceptor adds `Authorization: Bearer <token>` to all requests
3. Protected routes check `useAuth()` hook; unauthorized redirects to login
4. Admin routes check role from user profile
5. API responses cached in component state; no global Redux/Zustand needed

## Security Concept

### Frontend Security

| Layer                 | Mechanism                      | Implementation                                                         |
| --------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| **Authentication**    | JWT tokens in localStorage     | Token obtained at login, persisted across sessions                     |
| **Route Protection**  | ProtectedRoute component       | Checks `useAuth().isAuthenticated` before rendering                    |
| **Role-Based Access** | Admin route guards             | Checks `user.role === 'ADMIN'` in ProtectedRoute                       |
| **XSS Protection**    | React DOM sanitization         | React escapes content by default; no `dangerouslySetInnerHTML` used    |
| **Token Injection**   | Axios interceptor              | Automatically adds JWT to `Authorization` header on protected requests |
| **Session Expiry**    | JWT expiration claims          | Backend validates `exp` claim; frontend clears token on 401 response   |
| **Secure Storage**    | localStorage with domain scope | Token scoped to origin domain (no subdomains by default)               |

### Backend Security

| Layer                  | Mechanism                   | Implementation                                                                     |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| **Authentication**     | JWT validation              | JwtAuthenticationFilter validates token signature and expiration                   |
| **Authorization**      | Spring Security roles       | @PreAuthorize annotations enforce ROLE_USER and ROLE_ADMIN checks                  |
| **CORS**               | Spring Security CORS config | Allows origin http://localhost:5173, credentials enabled                           |
| **CSRF**               | Token-based (JWT)           | CSRF tokens unnecessary because JWT is not stored in cookies                       |
| **Input Validation**   | DTO validation              | @Valid annotations on controller parameters; HibernateValidator checks constraints |
| **SQL Injection**      | JPA parameterized queries   | All database queries use @Query with named/positional parameters                   |
| **Password Storage**   | BCrypt hashing              | Passwords hashed with BCryptPasswordEncoder before storage                         |
| **Endpoint Hardening** | Role-based access control   | All sensitive endpoints require ROLE_ADMIN or authenticated ROLE_USER              |

### Attack Surface & Mitigations

| Threat                   | Attack Vector              | Mitigation                                                                  |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------- |
| **Session Hijacking**    | Token theft via XSS        | localStorage scoped to domain; HttpOnly flag not possible (API requirement) |
| **Replay Attacks**       | Reusing captured token     | JWT expiration (default 7 days); backend validates `iat` claim freshness    |
| **CSRF**                 | Cross-site request forgery | JWT in Authorization header (not cookie) prevents automatic inclusion       |
| **Brute Force (Auth)**   | Password guessing          | No rate limiting currently; recommended: add throttling on `/login`         |
| **Privilege Escalation** | Modifying JWT claims       | JWT signature validation prevents tampering; secret key protects integrity  |
| **Data Exposure**        | Unencrypted transit        | HTTPS recommended in production; current dev uses HTTP                      |
| **Admin Impersonation**  | Claiming admin role        | Backend validates role from database, not from JWT claims alone             |

## Getting Started

### Prerequisites

- Docker Engine (latest stable)
- Docker Compose v2+
- Git
- PowerShell 5.1+ or PowerShell 7+ (for running the end-to-end test script)

### Installation

1. Clone the repository.
2. Build the container images.
3. Start the containerized services.

```bash
# Clone the repository
git clone https://github.com/Elysiummmm/WISS-TCG.git
cd WISS-TCG

# Build images
docker compose build

# Start services in background
docker compose up -d
```

### Environment Variables

The backend reads configuration from `application.properties` and can be overridden by environment variables.

| Variable                   | Required            | Default / Example                     | Description                                               |
| -------------------------- | ------------------- | ------------------------------------- | --------------------------------------------------------- |
| SPRING_DATASOURCE_URL      | No                  | jdbc:mysql://localhost:3306/wissTcgDb | Backend MySQL JDBC connection URL                         |
| SPRING_DATASOURCE_USERNAME | No                  | root                                  | Backend database username                                 |
| SPRING_DATASOURCE_PASSWORD | No                  | empty string                          | Backend database password                                 |
| JWT_SECRET                 | Recommended         | 64+ char random secret                | JWT signing key (maps to `jwt.secret`)                    |
| JWT_EXPIRATION             | No                  | 604800000                             | JWT expiration in milliseconds (maps to `jwt.expiration`) |
| MYSQL_DATABASE             | No (Docker Compose) | wissTcgDb                             | Initial database name for the MySQL container             |
| MYSQL_USER                 | No (Docker Compose) | tcg_user                              | Application database user for container setup             |
| MYSQL_PASSWORD             | No (Docker Compose) | marmar2                               | Application database password for container setup         |

The frontend API URL is currently hardcoded in `frontend/src/utils/api.js` as `http://localhost:8080/api`.

### Running the Project

```bash
# Start full stack (db + backend + frontend)
docker compose up --build -d

# Stop and remove containers
docker compose down

# Restart existing stack
docker compose up -d
```

```bash
# Run backend + database only
docker compose -f docker-compose.no-frontend.yml up --build -d

# Stop backend + database only stack
docker compose -f docker-compose.no-frontend.yml down
```

## Project Structure

```text
WISS-TCG/
├── .github/
│   └── java-upgrade/
├── backend/
│   ├── src/main/java/dev/glup/wissTcgBackend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   ├── service/
│   │   └── util/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── views/
│   └── package.json
├── docs/
│   ├── API_ENDPOINTS.md
│   ├── ROLES_SETUP.md
│   ├── erd.png
│   ├── jwtAuthFlow.png
│   ├── layer_architecture.png
│   ├── stateManagementFlow.png
│   └── drawio/
│       ├── erd.drawio
│       ├── jwtAuthFlow.drawio
│       ├── layer_architecture.drawio
│       └── stateManagementFlow.drawio
├── docker-compose.yml
├── docker-compose.no-frontend.yml
└── e2e_test.ps1
```

## API Documentation

The API currently exposes 30 endpoints across authentication, cards, deck, users, rooms, matches, and admin operations.

- Main endpoint reference: `docs/API_ENDPOINTS.md`
- Roles and permissions notes: `docs/ROLES_SETUP.md`

Key endpoint groups:

- Auth: `/api/auth/register`, `/api/auth/login`
- Cards: `/api/cards`, `/api/cards/open`, `/api/cards/my-collection`
- Deck: `/api/deck`
- Rooms: `/api/rooms`, `/api/rooms/{roomId}/join`, `/api/rooms/{roomId}/start`
- Matches: `/api/matches/{matchId}`, `/api/matches/{matchId}/round`, `/api/matches/leaderboard/top`
- Admin: `/api/admin/cards`, `/api/admin/users`, moderation and promotion endpoints

## Deployment

Use Docker Compose for local deployment and service integration.

```bash
docker compose up --build -d
docker compose logs -f
```

Deployment notes:

1. `docker compose up --build -d` builds and starts MySQL, backend, and frontend.
2. Backend is exposed on `http://localhost:8080` and frontend on `http://localhost:5173`.
3. For backend-only deployment, use `docker-compose.no-frontend.yml`.

## Testing

```powershell
# Run end-to-end smoke/system tests
# Prerequisite: full stack running on localhost (typically via docker compose up -d)
powershell -ExecutionPolicy Bypass -File .\e2e_test.ps1
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Authors

- https://github.com/Elysiummmm
- https://github.com/m4rv1n33
