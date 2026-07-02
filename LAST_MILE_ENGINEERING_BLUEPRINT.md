# Last Mile Engineering Blueprint

## 1. Existing Repository Analysis

### Current architecture style

- Next.js App Router application.
- Clear separation between UI, API, service, repository, and database layers.
- Authentication-first foundation built on NextAuth, JWT session strategy, and Drizzle ORM.
- Route-grouped public, auth, and protected experiences.

### Existing folder organization

- `src/app/` holds pages, layouts, and API routes.
- `src/components/` holds reusable UI components and shared primitives.
- `src/lib/` holds shared utilities, database config, queries, validation schemas, type definitions, mail templates, and hooks.
- `src/services/` holds authentication business workflows.
- Root files `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`, and `src/route.ts` hold centralized auth and routing logic.

### Existing dependency direction

- `src/app` depends on `src/components`, `src/services`, `src/lib`, and `src/auth`.
- `src/app/api` depends on `src/services` and `src/lib`.
- `src/services` depends on `src/lib` and shared utilities.
- `src/lib/queries` depends on `src/lib/dbconfig`.
- `src/lib/dbconfig` is the lowest layer and depends on no upper layers.

### Existing authentication flow

- Auth pages are in `src/app/(auth)`.
- Auth UI components are in `src/components/auth`.
- Login/signup flows use `src/app/api/auth` endpoints.
- `src/auth.config.ts` defines NextAuth providers and credentials logic.
- `src/auth.ts` configures NextAuth callbacks, session mapping, and the Drizzle adapter.
- `src/proxy.ts` enforces authentication for protected routes and redirects unauthenticated users to `/login`.
- Session state is JWT-based with user role and two-factor state mapped into session tokens.

### Existing database structure

- Database schema is defined in `src/lib/dbconfig/schema.ts` using Drizzle ORM.
- Existing auth-related entities:
    - `user`
    - `account`
    - `verificationToken`
    - `resetPasswordToken`
    - `twoFactorTokens`
    - `twoFactorConfirmation`
- Typed repository helpers are organized in `src/lib/queries/`.
- The schema exports `Insert*` and `Select*` types.

### Existing reusable infrastructure

- Authentication: `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`, `src/route.ts`, `src/next-auth.d.ts`.
- Database: `src/lib/dbconfig/db.ts`, `src/lib/dbconfig/schema.ts`, `src/lib/queries/*`.
- Email: `src/services/authServices/mail.ts`, `src/lib/mail/*`.
- Validation: `src/lib/schema/authSchema.ts` and Zod schemas.
- Utilities: `src/lib/utils.ts`, shared UI primitives in `src/components/ui`.
- Session: NextAuth session and JWT callback logic in `src/auth.ts`.

### What should be reused

- Existing auth and session infrastructure for all future protected work.
- Existing query/repository pattern in `src/lib/queries`.
- Existing service orchestration pattern in `src/services`.
- Existing shared UI primitives in `src/components/ui`.
- Existing Zod-based validation conventions in `src/lib/schema`.

### What should NOT be changed

- Existing authentication, middleware, routing, services, database schema, and UI components.
- Existing auth provider configuration and protected route matcher behavior.
- Existing folder names and current source file locations.

## 2. Final Architecture Decisions

### Final folder structure

- `src/`
    - `app/`
        - `(auth)/`
        - `(protected)/`
        - `api/`
    - `components/`
        - `auth/`
        - `dashboard/`
        - `landing/`
        - `ui/`
    - `lib/`
        - `dbconfig/`
        - `queries/`
        - `schema/`
        - `types/`
        - `mail/`
        - `hooks/`
        - `utils.ts`
    - `services/`
        - `authServices/`
    - `auth.ts`
    - `auth.config.ts`
    - `proxy.ts`
    - `route.ts`

This is the single frozen structure. Future implementation must fit within these folders and avoid adding alternative top-level module patterns.

### Final layer structure

UI
?
API
?
Services
?
Repositories
?
Database

This is frozen. No future implementation may reverse this direction.

### Repository pattern

- All database queries belong in `src/lib/queries/`.
- Query modules are the only place for raw database access.
- Query modules may depend on `src/lib/dbconfig` and `src/lib/types` only.

### Service pattern

- Services in `src/services/` call repository query modules.
- Services orchestrate validation, repository calls, and external integration.
- Services do not access the database directly and do not import UI components.

### API strategy

- Keep API surface minimal and aligned with assignment domains.
- Only require endpoints that support core domain operations.
- The frozen API surface for future work is:
    - `POST /api/orders`
    - `GET /api/orders`
    - `GET /api/orders/:id`
    - `PATCH /api/orders/:id`
    - `GET /api/customers`
    - `POST /api/customers`
    - `GET /api/agents`
    - `POST /api/agents`
    - `GET /api/zones`
    - `POST /api/zones`
    - `GET /api/rate-cards`
    - `POST /api/rate-cards`
    - `GET /api/tracking/:orderId`
    - `POST /api/notifications`

These endpoints are the minimal implementation surface to support core delivery domains. No additional domain endpoints are included unless required by the assignment.

### Database entities

- Keep only the entities required for the assignment.
- The frozen domain entities are:
    - Orders
    - Customers
    - Agents
    - Zones
    - RateCards
    - Tracking
    - Notifications

No speculative entities beyond these assignment-specific domains.

### User roles

- Freeze the role model to the minimum required set:
    - `USER`
    - `ADMIN`
- Existing `SUPER_ADMIN` is not part of the frozen role model for this assignment.
- Future role-based behavior must use only `USER` and `ADMIN` unless architect approval explicitly adds a third role.

### Validation strategy

- Validation occurs in API handlers before service execution.
- Use Zod schemas defined in `src/lib/schema/`.
- Services may assert invariants but do not duplicate request validation.
- Repositories do not validate user input.

### Error handling strategy

- API routes return a standardized JSON envelope.
- Success response: `{ "success": true, "data": ... }`.
- Error response: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }`.
- Services throw errors; repositories propagate errors upward.
- API handlers catch and map errors to status codes and standardized responses.

### Naming conventions

- Folders: kebab-case.
- React components: PascalCase and `.tsx`.
- Service files: `<domain>.service.ts`.
- Repository files: `<domain>.repository.ts` or action-specific files under `src/lib/queries/<domain>/`.
- Type files: `<domain>.types.ts` in `src/lib/types/`.
- Schema files: `<domain>.schema.ts` in `src/lib/schema/`.
- Validator files: `<domain>.validator.ts` in `src/lib/schema/` when separate validation helpers are needed.
- API routes: `route.ts` under `src/app/api/<domain>/`.
- Page files: `page.tsx` and layout files: `layout.tsx`.

### Implementation order

1. Backend domain contracts and repository skeletons.
2. Backend services and API route implementation.
3. API route testing and contract validation.
4. UI integration only after backend implementation is complete.

This order is frozen: backend first, API testing before frontend.

## 3. Simplified Domain Model

Future domains are defined for the assignment, but implementation must remain minimal and focused.

- Users: existing auth and profile.
- Orders: core delivery requests and status.
- Customers: delivery recipients and contact data.
- Agents: delivery personnel and assignments.
- Zones: service areas and coverage.
- RateCards: pricing rules.
- Tracking: order tracking state.
- Notifications: delivery alerts.

## 4. Review Summary

### Architectural improvements made

- Frozen a single folder structure.
- Removed optional or speculative alternatives.
- Clarified that only `src/lib/queries` may contain raw database access.
- Defined exact validation and error handling behavior.
- Fixed the role model to the minimum required set.
- Frozen the implementation order to backend-first.

### Complexity removed

- Removed open-ended domain-tree proposals.
- Removed open questions and alternative design paths.
- Removed speculative entities and API endpoints beyond the assignment.
- Eliminated multiple folder structure options.

### Remaining risks

- The current auth route protection is broad and may need explicit fine-grained authorization later.
- Existing `SUPER_ADMIN` support exists in code but is excluded from the frozen role model.
- Route and folder decisions are based on the existing repository shape and may need adjustment if assignment scope changes.

### Final engineering decisions

- Keep the existing repository structure and extend within it.
- Enforce UI ? API ? Services ? Repositories ? Database.
- Place all queries in `src/lib/queries/`.
- Services call repositories only.
- Use a minimal API surface focused on assignment domains.
- Restrict roles to `USER` and `ADMIN`.
- Validate in API handlers with Zod.
- Standardize API responses.
- Build backend first, UI last.

## 5. Files modified

- `LAST_MILE_ENGINEERING_BLUEPRINT.md`

## 6. Validation results

- Validation is pending manual git verification.
- This change only updates the blueprint document.

## 7. STOP

- No implementation changes were made.
