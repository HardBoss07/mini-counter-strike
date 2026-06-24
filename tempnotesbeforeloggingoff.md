notes:

there is the issue again of the ghost members in the queue, so that after a round has concluded, they are still in the matchmaking queue which makes user2 match up with a ghost copy of user1 which leads then to a frozen state of the app, where you can only surrender.

this is the project structure

mini-counter-strike/
├── backend/
│ ├── src/
│ │ ├── main/
│ │ │ ├── java/
│ │ │ │ └── dev/
│ │ │ │ └── m4tt3o/
│ │ │ │ └── minics/
│ │ │ │ ├── config/
│ │ │ │ │ ├── GameConfig.java
│ │ │ │ │ ├── JwtAuthenticationFilter.java
│ │ │ │ │ ├── JwtUtil.java
│ │ │ │ │ └── SecurityConfig.java
│ │ │ │ ├── controller/
│ │ │ │ │ ├── AuthController.java
│ │ │ │ │ ├── EconomyController.java
│ │ │ │ │ ├── InventoryController.java
│ │ │ │ │ ├── LeaderboardController.java
│ │ │ │ │ ├── LoadoutController.java
│ │ │ │ │ ├── MatchController.java
│ │ │ │ │ ├── UserController.java
│ │ │ │ │ └── WeaponController.java
│ │ │ │ ├── dto/
│ │ │ │ │ ├── economy/
│ │ │ │ │ │ └── OpenCaseResponse.java
│ │ │ │ │ ├── inventory/
│ │ │ │ │ │ ├── InventoryResponse.java
│ │ │ │ │ │ └── WeaponInstanceDTO.java
│ │ │ │ │ ├── leaderboard/
│ │ │ │ │ │ └── LeaderboardEntry.java
│ │ │ │ │ ├── match/
│ │ │ │ │ │ ├── LiveMatchState.java
│ │ │ │ │ │ └── MatchStateResponse.java
│ │ │ │ │ ├── user/
│ │ │ │ │ │ └── UserProfileResponse.java
│ │ │ │ │ ├── CombatRoundRecord.java
│ │ │ │ │ ├── ItemRarity.java
│ │ │ │ │ ├── ItemType.java
│ │ │ │ │ ├── PlayerState.java
│ │ │ │ │ ├── SaveLoadoutRequest.java
│ │ │ │ │ ├── StatusEffect.java
│ │ │ │ │ └── WeaponArchetype.java
│ │ │ │ ├── engine/
│ │ │ │ │ └── MatchEngine.java
│ │ │ │ ├── entity/
│ │ │ │ │ ├── Loadout.java
│ │ │ │ │ ├── Match.java
│ │ │ │ │ ├── User.java
│ │ │ │ │ ├── UserWeaponInstance.java
│ │ │ │ │ └── WeaponTemplate.java
│ │ │ │ ├── repository/
│ │ │ │ │ ├── LoadoutRepository.java
│ │ │ │ │ ├── MatchRepository.java
│ │ │ │ │ ├── UserRepository.java
│ │ │ │ │ ├── UserWeaponInstanceRepository.java
│ │ │ │ │ └── WeaponTemplateRepository.java
│ │ │ │ ├── service/
│ │ │ │ │ ├── AuthService.java
│ │ │ │ │ ├── AuthServiceImpl.java
│ │ │ │ │ ├── InventoryService.java
│ │ │ │ │ ├── LoadoutService.java
│ │ │ │ │ ├── LoadoutServiceImpl.java
│ │ │ │ │ ├── MatchService.java
│ │ │ │ │ ├── MatchServiceImpl.java
│ │ │ │ │ └── MatchmakingService.java
│ │ │ │ └── MiniCsApplication.java
│ │ │ └── resources/
│ │ │ ├── application.properties
│ │ │ ├── data.sql
│ │ │ └── schema.sql
│ │ └── test/
│ │ └── java/
│ │ └── dev/
│ │ └── m4tt3o/
│ │ └── minics/
│ │ └── MiniCsApplicationTests.java
│ ├── Dockerfile
│ ├── HELP.md
│ ├── mvnw
│ ├── mvnw.cmd
│ └── pom.xml
├── docs/
│ └── references/
│ ├── Features.md
│ └── README.md
├── frontend/
│ ├── public/
│ │ ├── images/
│ │ │ ├── AK-47/
│ │ │ │ ├── Elite_Build.png
│ │ │ │ ├── Gold_Arabesque.png
│ │ │ │ ├── Redline.png
│ │ │ │ ├── Safari_Mesh.png
│ │ │ │ └── Slate.png
│ │ │ └── base/
│ │ │ ├── AK-47.png
│ │ │ ├── AWP.png
│ │ │ ├── Desert_Eagle.png
│ │ │ ├── FAMAS.png
│ │ │ ├── Galil_AR.png
│ │ │ ├── Glock-18.png
│ │ │ ├── M4A1-S.png
│ │ │ ├── M4A4.png
│ │ │ ├── MAC-10.png
│ │ │ ├── MP7.png
│ │ │ ├── MP9.png
│ │ │ ├── SSG_08.png
│ │ │ ├── USP-S.png
│ │ │ ├── flashbang_grenade.png
│ │ │ ├── he_grenade.png
│ │ │ ├── molotov_grenade.png
│ │ │ └── smoke_grenade.png
│ │ ├── favicon.svg
│ │ └── icons.svg
│ ├── src/
│ │ ├── assets/
│ │ │ ├── hero.png
│ │ │ ├── react.svg
│ │ │ └── vite.svg
│ │ ├── components/
│ │ │ ├── atoms/
│ │ │ │ └── StatBadge.tsx
│ │ │ ├── molecules/
│ │ │ │ └── WeaponCard.tsx
│ │ │ └── organisms/
│ │ │ ├── Armory.tsx
│ │ │ ├── CardSorter.tsx
│ │ │ ├── LoadoutZone.tsx
│ │ │ └── Navbar.tsx
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── hooks/
│ │ │ └── useWeaponData.ts
│ │ ├── utils/
│ │ │ └── api.ts
│ │ ├── views/
│ │ │ ├── AuthView.tsx
│ │ │ ├── BattleView.tsx
│ │ │ ├── CasesView.tsx
│ │ │ ├── DashboardView.tsx
│ │ │ ├── InventoryView.tsx
│ │ │ ├── LeaderboardView.tsx
│ │ │ ├── LoadoutBuilderView.tsx
│ │ │ └── MatchmakingView.tsx
│ │ ├── App.css
│ │ ├── App.tsx
│ │ ├── Layout.tsx
│ │ ├── index.css
│ │ └── main.tsx
│ ├── Dockerfile
│ ├── README.md
│ ├── eslint.config.js
│ ├── index.html
│ ├── package-lock.json
│ ├── package.json
│ ├── postcss.config.js
│ ├── tailwind.config.js
│ ├── tsconfig.app.json
│ ├── tsconfig.json
│ ├── tsconfig.node.json
│ └── vite.config.ts
├── Endpoints_and_Views.md
├── GameLogic.md
├── HANDOFF.md
├── LICENSE
├── Weapons.md
├── docker-compose.yml
├── package-lock.json
├── package.json
└── tempnotesbeforeloggingoff.md
