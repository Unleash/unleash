## Domain Boundaries & Coupling Findings (src/lib)

### Proposed Domains
- **Identity & Access**: accounts/users, roles/groups/permissions, sessions, tokens (API/PAT/public signup), RBAC. Stores: `src/lib/db/access-store.ts`, `src/lib/db/account-store.ts`, `src/lib/db/session-store.ts`, `src/lib/db/api-token-store.ts`, `src/lib/db/pat-store.ts`, `src/lib/db/public-signup-token-store.ts`, `src/lib/db/group-store.ts`, `src/lib/db/role-store.ts`.
- **Feature Configuration & Lifecycle**: features, strategies/variants, tags, segments, environments, projects, release/change governance, feature lifecycle/links, dependent features. Stores: `src/lib/features/feature-toggle/feature-toggle-store.ts`, `src/lib/features/feature-toggle/feature-toggle-strategies-store.ts`, `src/lib/db/feature-tag-store.ts`, `src/lib/db/feature-environment-store.ts`, `src/lib/features/project-environments/environment-store.ts`, `src/lib/features/project/project-store.ts`, `src/lib/features/segment/segment-store.ts`, `src/lib/features/release-plans/*`, `src/lib/features/feature-lifecycle/feature-lifecycle-store.ts`, `src/lib/features/feature-links/feature-link-store.ts`.
- **Metrics & Analytics**: events, client metrics, last-seen, unknown flags, traffic usage, project stats, instance stats, project health. Stores/read models: `src/lib/db/event-store.ts`, `src/lib/features/metrics/client-metrics/client-metrics-store-v2.ts`, `src/lib/features/metrics/last-seen/last-seen-store.ts`, `src/lib/features/metrics/unknown-flags/unknown-flags-store.ts`, `src/lib/features/traffic-data-usage/traffic-data-usage-store.ts`, `src/lib/db/project-stats-store.ts`, plus metrics read models under `src/lib/features/metrics/*` and project health.
- **Integrations & Extensibility**: addons and integration events. Stores: `src/lib/db/addon-store.ts`, `src/lib/features/integration-events/integration-events-store.ts`.
- **User Experience & Personalization**: onboarding, user splash, favorites, feedback, subscriptions/personal dashboards/updates. Stores/read models: `src/lib/features/onboarding/onboarding-store.ts`, `src/lib/db/user-splash-store.ts`, `src/lib/db/favorite-features-store.ts`, `src/lib/db/favorite-projects-store.ts`, `src/lib/db/user-feedback-store.ts`, `src/lib/features/user-subscriptions/*`, `src/lib/features/personal-dashboard/*`, `src/lib/features/users/user-updates-read-model.ts`.

### Boundary Breaks (cross-domain coupling)
- `src/lib/features/feature-toggle/feature-toggle-store.ts:194-200` — Feature config store joins `favorite_features` to decorate feature lists (personalization leaking into feature config).
- `src/lib/features/feature-toggle/feature-toggle-store.ts:691-718` — Populates `created_by_user_id` via joins to `events`, `users`, and `api_tokens` (audit/identity concerns inside feature store).
- `src/lib/features/project-environments/environment-store.ts:205-270` — Environment store subqueries `api_tokens`, `feature_environments`, `features`, `project_environments` to compute counts/defaults (environment provisioning mixed with tokens and feature analytics).
- `src/lib/db/project-stats-store.ts:117-188` — Computes time-to-prod metrics by joining `events`, `environments`, `features` inside the store (analytics logic embedded in persistence).
- `src/lib/db/access-store.ts:332-345` — RBAC store deletes `personal_access_tokens` and `public_signup_tokens_user` (token lifecycle belongs to identity/auth, not role assignment).
- `src/lib/db/account-store.ts:150-170` — Account store joins `personal_access_tokens` to resolve users/mark seen (token tracking mixed into account retrieval).

### Recommendations
- Extract cross-domain enrichment into dedicated read models/services (e.g., favorites/adoption and audit lookups outside `feature-toggle-store`; an Audit/UserLookup helper for created-by resolution).
- Keep stores scoped to their aggregate only; expose counts/metrics via analytics read models instead of embedding subqueries in core stores (environment counts, project stats).
- For identity vs access, route token lifecycle operations through token stores/services rather than `access-store`/`account-store`.
- Annotate domain ownership in `src/lib/db/index.ts` wiring and prefer injecting domain-level services instead of direct table joins across domains.
