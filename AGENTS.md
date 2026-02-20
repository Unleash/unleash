# Agent Instructions for Unleash

This document provides AI coding assistants with context about the Unleash codebase. It is tool-agnostic and can be referenced by any AI assistant configuration.

## Project Overview

Unleash is an open-source feature flagging platform. This repository (OSS) is a monorepo containing:

- **Backend**: Node.js/TypeScript REST API (`/src`)
- **Frontend**: React/TypeScript single-page application (`/frontend`)

**Enterprise** extends OSS via a separate repository (`unleash-enterprise`) using a hook-based architecture. Enterprise does not fork OSS; it injects additional functionality through `preRouterHook`. If the user says that this is an enterprise feature, you need to ask where the enterprise repository is located and work across both this repository and the enterprise repository. 

## Architecture

### Backend (`/src`)

The backend follows a **CSR (Controller, Service, Repository/Store)** pattern. We promote packages by feature, not by layer (see feature-based modules below), although the legacy components are still packed by layer:

- **Controllers** (`/src/lib/routes/`): Handle HTTP requests, validate input, delegate business logic to services, and demarcate transactions.
- **Services** (`/src/lib/services/`): Business logic layer, emit events, manage transactions
- **Stores** (`/src/lib/db/`): Data access layer using Knex query builder

**Feature-based modules** live in `/src/lib/features/` where each domain contains its own controller, service, store, and types. Examples: `feature-toggle`, `project`, `segment`, `change-request`, `release-plans`.

**Key Patterns**:
- **Audit-log**: Services emit typed events (`FeatureCreatedEvent`, etc.) for audit trails and read model updates
- **Transaction wrapper**: Use `withTransactional()` for atomic operations across services. The common pattern is initiating transactions at the controller level.
- **Fake implementations**: Every store/service has a Fake variant for testing (prefer over mocking)
- **Internal feature flags**: `flagResolver.isEnabled()` controls operational features

**Stack**: Express, PostgreSQL with Knex, TypeScript with ES modules

### Frontend (`/frontend/src`)

The frontend is a React SPA communicating with the backend via REST API.

- **Components**: `/frontend/src/component/` - React components organized by feature domain
- **Hooks**: `/frontend/src/hooks/` - 71+ custom hooks for data fetching and mutations
- **Contexts**: `AccessContext` (permissions), `UIContext` (toasts, theme)

**Key Patterns**:
- **Data fetching**: SWR-based `useApiGetter` hooks for GET requests with caching
- **Mutations**: `useApi` hook for POST/PUT/DELETE with error handling
- **Route gating**: Routes support `flag`, `enterprise`, and `configFlag` properties
- **Styling**: MUI `styled()` components with emotion, use `sx` for one-offs

**Stack**: React 18+, Vite, Material-UI (MUI), SWR for server state

## Enterprise Integration

Enterprise extends OSS through hooks without forking:

1. **Entry**: `unleash-enterprise/src/index.ts` wraps OSS `start()`/`create()`
2. **Hook**: `preRouterHook` runs after OSS init, before route binding
3. **Extension**: Adds 50+ services, 30+ stores, 50+ controllers
4. **Gating**: License middleware restricts enterprise features

**Enterprise-Only Features**: Change Requests, SSO (SAML/OIDC), Service Accounts, Signals & Actions, Insights, SCIM, Private Projects, Release Plans, Safeguards

**Combined Interfaces**: `IEnterpriseServices extends IUnleashServices`, `IUnleashEnterpriseStores extends IUnleashStores`

## Composition Root Pattern

All dependencies are wired at application startup, not scattered throughout the codebase. All services have a dedicated composition root function to stand up the service.:

**OSS Composition**:
- `/src/lib/db/index.ts` → `createStores()` instantiates all stores with Knex connection
- `/src/lib/services/index.ts` → `createServices()` instantiates all services with stores + config
- `/src/lib/server-impl.ts` → Orchestrates: DB → Stores → Services → App

**Enterprise Composition**:
- `enterprise/src/util/setup-stores.ts` → Creates enterprise stores, merges with OSS stores
- `enterprise/src/util/setup-services.ts` → Creates enterprise services with combined stores
- `enterprise/src/create-enterprise-routes.ts` → Wires everything in `preRouterHook`

**Why this matters**: Never `new` a service/store inline. Always receive dependencies through constructor injection. This enables testing with fakes and keeps the dependency graph explicit.

## Read Models vs Write Models

To avoid overloading stores with complex queries, we separate read and write concerns:

**Write Models (Stores)**: Handle CRUD operations on single entities
- Keep queries simple: insert, update, delete, getById
- Located in `/src/lib/db/` or feature directories
- Example: `FeatureToggleStore` handles basic feature CRUD

**Read Models**: Handle complex queries, aggregations, cross-domain queries and denormalized views
- Optimized for specific read use cases (dashboards, lists, reports)
- Located in feature `/read-models/` directories
- Example: `FeatureStrategiesReadModel`, `ProjectOwnersReadModel`, `FeatureSearchReadModel`

**When to use Read Models**:
- Query spans multiple tables with complex joins
- Need denormalized data for performance
- Building dashboard/overview endpoints
- Query doesn't map to a single entity's lifecycle
- You don't want to expose the entire write model and only need one value from another module

**Pattern**: Services coordinate between stores (writes) and read models (reads). Controllers call services or  read models, never stores directly.

## Development Philosophy

We follow three core principles:

1. **Test code always** - We test our code and prefer automation over manual testing
2. **Write maintainable code** - Code is communication; clarity and readability are paramount
3. **Think before committing** 

## Coding Standards

Detailed standards are documented as Architectural Decision Records (ADRs). They can be located:
- /contributing/ADRs/back-end/
- /contributing/ADRs/front-end/
- /contributing/ADRs/overarching/

## Database Migrations

- Migrations live in `/src/migrations/`
- Never modify a merged migration; create a new one instead
- Each migration needs `up` and `down` methods
- Use `yarn db-migrate create <name>` to create new migrations

## Testing

- **Backend**: Vitest + Supertest for API testing; fake stores for isolation
- **Frontend**: Vitest + Testing Library
- **E2E**: Cypress (`/frontend/cypress/`)

Run tests with:
```bash
yarn test          # All tests
yarn test:frontend # Frontend only
yarn test:backend  # Backend only
```

## Critical Files Reference

### OSS Entry Points
| File | Purpose |
|------|---------|
| `/src/server.ts` | Main entry point |
| `/src/lib/app.ts` | Express app setup, middleware stack |
| `/src/lib/routes/index.ts` | Route registration |
| `/src/lib/services/index.ts` | Service factory |
| `/src/lib/db/index.ts` | Store factory |
| `/src/lib/types/index.js` | Importing types | 

### Pattern References
| Pattern | Example Location |
|---------|-----------------|
| Controller | `/src/lib/features/feature-toggle/feature-toggle-controller.ts` |
| Service | `/src/lib/features/feature-toggle/feature-toggle-service.ts` |
| Store (write model) | `/src/lib/features/feature-toggle/feature-toggle-store.ts` |
| Read Model | `/src/lib/features/feature-search/feature-search-read-model.ts` |
| Composition Root | `/src/lib/services/index.ts` |
| API Hook (GET) | `/frontend/src/hooks/api/getters/useFeature/useFeature.ts` |
| API Hook (mutation) | `/frontend/src/hooks/api/actions/useFeatureApi.ts` |
| Fake Store | `/src/test/fixtures/fake-feature-toggle-store.ts` |

