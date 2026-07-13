# Handoff

## Goal

Maintain a seamless, turn-based battle engine with utility chaining, persistent asynchronous state updates via Server-Sent Events (SSE), and correct side-swapped deck consistency. In parallel, deliver a robust, strictly typed CS2-style Case Opening system supporting discrete user container inventory instances, probability-weighted random drops from template loot pools, and an authentic horizontal scrolling marquee animation sequence. All additions must ensure zero functional regressions and uphold strict separation of concerns across the stack.

## Current State

- **Architecture:** Core engine logic remains highly decoupled following the elimination of the God Object anti-pattern. Added support for Container Cases via explicit `CaseTemplate` pools and unique user-bound `UserCaseInstance` ownership tables.
- **Networking:** Asynchronous match state updates run persistently over SSE. Standard HTTP endpoints route the new inventory and economy actions.
- **Economy & Cases System:** Added single-purpose endpoints to fetch the user's specific un-opened containers and to process localized opening selections (`POST /api/economy/cases/{id}/open`).
- **Frontend Architecture:** Reconstructed the non-selective screen into a modular two-stage experience in `CasesView.tsx`:
  1. An inventory selection view rendering a grid of individual container keys via the atomic `CaseCard` component.
  2. A dedicated unboxing carousel viewport managing a randomized layout track of 45 items that slides using fluid cubic-bezier CSS animations, terminating exactly centered on the server-calculated winning weapon item.
- **State Management & Validation:** All backend endpoint methods use isolated data transfer mechanisms (`UserCaseInstanceDTO`, `CaseTemplateDTO`, and `OpenCaseResponse`). The API client wrapper layer (`api.ts`) consumes these payload models with 100% strict contract conformance.
- **Status:** Core frontend view updates, API services, and presentation atoms are written and type-checked. Ready for final endpoint security tuning to eliminate routing errors.

## Files Actively Involved

**Core Services & Routing:**

- `backend/src/main/java/dev/m4tt3o/minics/controller/InventoryController.java` / `EconomyController.java`: Handles target routing for case queries and unboxing requests.
- `backend/src/main/java/dev/m4tt3o/minics/service/InventoryServiceImpl.java`: Manages case-to-item probability resolution, case instance lifecycle pruning, and user inventory additions.

**Entities & DTOs:**

- `backend/src/main/java/dev/m4tt3o/minics/entity/CaseTemplate.java` & `UserCaseInstance.java`: Database persistent mappings for case entities.
- `backend/src/main/java/dev/m4tt3o/minics/dto/inventory/CaseTemplateDTO.java` & `UserCaseInstanceDTO.java`: Standardized case metadata mapping schemas.
- `backend/src/main/java/dev/m4tt3o/minics/dto/economy/OpenCaseResponse.java`: Payload contract containing the unboxed weapon's attributes.

**Frontend View Layer:**

- `frontend/src/views/CasesView.tsx`: Manages inventory picker layout state transitions and carousel timing lifecycles.
- `frontend/src/components/atoms/CaseCard.tsx`: Dedicated presentation atom for specific case inventory records.
- `frontend/src/utils/api.ts`: Bound endpoint wrapper definitions handling JWT header configuration and error mapping.
- `frontend/src/types/weapon.ts`: Houses strict typescript models matching backend records.

## Investigation History & Learnings

- **Debugging the `403 Forbidden` Error on Case Endpoints:** Spring Security defaults to throwing a `403 Forbidden` response for a variety of hidden underlying conditions rather than a true authorization failure. When interfacing with the new case endpoints, check the following structural issues in order:
  1. **CSRF Protection Defenses:** Because the open case request executes via an state-mutating `POST` method, Spring Security will reject the transaction with a `403 Forbidden` if CSRF protection is active but token synchronization isn't configured for that path. Ensure `/api/economy/**` and `/api/inventory/**` matchers are correctly chained into the `.csrf(csrf -> csrf.ignoringRequestMatchers(...))` block inside `SecurityConfig.java`.
  2. **Endpoint Mapping Misalignments:** Spring Security throws a generic `403` if a resource path is incorrectly defined or not registered as a bean controller endpoint. Verify that the controller annotations (`@RestController` + `@RequestMapping`) align precisely with the frontend routes (`/api/inventory/cases` and `/api/economy/cases/{userCaseInstanceId}/open`).
  3. **Role/Authority Restraints:** Ensure the security filter chain configuration contains permissive authorization lines (e.g., `.requestMatchers("/api/inventory/**", "/api/economy/**").authenticated()`) so valid user JWTs aren't preemptively screened out.
- **Carousel Animation Mechanics:** Precise centering within the viewport relies on a uniform horizontal cell tracking width. The carousel component applies a fixed spacing framework combining card dimensions with layout margins (`w-48` equivalent to `192px` + `8px` gap = `200px` index intervals). The final left shift offset calculates dynamically using `(targetIndex * cardWidthWithGap) - (viewportContainerWidth / 2 - cardWidthWithGap / 2)`.

## Next Steps

1. **Spring Security Alignment:** Open `backend/src/main/java/dev/m4tt3o/minics/config/SecurityConfig.java` to verify that the endpoints are accessible to authenticated sessions and that the `POST` request is properly excluded from restrictive CSRF interception rules.
2. **Backend Integrity Verification:** Verify that `InventoryServiceImpl` processes the probability pool calculation using clean sub-functions, ensuring the template items are loaded correctly from `CaseTemplateRepository` and `UserCaseInstanceRepository`.
3. **Integration Verification:** Run a local live-instance unboxing sequence. Confirm that upon animation completion (`onTransitionEnd`), the won weapon displays and the case layout collection safely updates via cache invalidation hooks without throwing structural component regressions.
