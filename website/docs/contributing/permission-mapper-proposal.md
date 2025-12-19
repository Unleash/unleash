---
title: Permission mapper proposal
---

## Why

- ADR-XXX (“Generic Permission Model…”) introduces a structured permission model (resource/action + resource scope, with assignment qualifiers) while today’s API and database use opaque strings.
- We must avoid breaking external APIs, SDKs, and stored roles that expect the legacy strings.
- A mapper lets the domain adopt the new model internally while keeping the legacy contract at the boundary.

## Goals and constraints

- Keep external contract stable: roles, API responses, and DB rows continue to use the current strings.
- Provide an adapter: legacy string → structured permission (for domain logic), while still emitting legacy strings at the edges for backward compatibility.
- Surface places where the legacy strings are ambiguous relative to the new model.
- Keep the adapter explicit and testable; do not mix mapping logic into authorization checks.

## Proposed domain types

```ts
type ResourceScope = 'root' | 'project' | 'environment';

type Action =
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'apply'
    | 'approve'
    | 'skip' // this is a special action that only applies to bypass change request
    | 'move' // this is a special action that only applies to moving a feature flag from one project to another
    | 'manage'; // catch-all for settings bundles

type ResourceName =
    | 'project'
    | 'feature'
    | 'feature_strategy'
    | 'feature_environment'
    | 'feature_dependency'
    | 'feature_variant'
    | 'client_api_token'
    | 'frontend_api_token'
    | 'addon'
    | 'context_field'
    | 'application'
    | 'strategy'
    | 'segment'
    | 'tag_type'
    | 'instance_banner'
    | 'role'
    | 'logs'
    | 'maintenance_mode'
    | 'cors'
    | 'auth_configuration'
    | 'change_request'
    | 'project_settings'
    | 'project_user_access'
    | 'project_default_strategy'
    | 'release_plan_template'
    | 'user_pat';

type ResourceDefinition = {
    name: ResourceName;
    resourceScope: ResourceScope;
};

type Permission = {
    resource: ResourceName;
    action: Action;
};

type PermissionAssignment = {
    permission: Permission;
    qualifiers?: Record<string, string | undefined>; // e.g. projectId, environment
};
```

`ADMIN` remains a superuser sentinel; we can still express it as `{ resource: '*', action: '*', resourceScope: 'root' }` for internal consistency while keeping special-case handling.

Permissions inherit `resourceScope` from the resource catalog; the mapping table below is the source of truth for each resource’s scope.

Qualifiers define the reachable universe (global vs project/environment-specific) and further narrow access within that universe.

## Mapper (ports/adapters)

Create a dedicated adapter (hexagonal style) so that:

- Inbound port: `fromLegacy(id: string, ctx)` → `PermissionAssignment[]`.
  - Looks up static metadata for the legacy id.
  - Uses `permissions.type` (root/project/environment) to set the resource scope, and assignment context (projectId/environment) to set qualifiers on the assignment.
  - Environment/project on the assignment may be `undefined`/`null`, which today means “all environments/all projects” (broadest reach). Preserve that meaning explicitly in the **assignment qualifiers** (e.g. `qualifiers.environment = undefined` and/or a flag).
  - Returns `ADMIN` as a special-case Permission-like value (or short-circuits to “allow all”).
- Because some legacy ids expand to multiple structured permissions, the reverse mapping is lossy; we will carry both payloads at the edge (legacy + structured) and mark the legacy payload as deprecated rather than attempting a perfect inverse.

The mapping table lives in one place (e.g. `src/lib/features/rbac/permission-map.ts`) and is the single source of truth for inbound mapping. Mapping failures throw a typed error so we notice gaps.

## Exhaustive mapping table

| Legacy string | Resource | Action | Resource scope (from `permissions.type`) | Notes |
| --- | --- | --- | --- | --- |
| `ADMIN` | `*` | `*` | root | Superuser sentinel; bypasses normal checks |
| `CREATE_ADDON` | addon | create | root |  |
| `UPDATE_ADDON` | addon | update | root |  |
| `DELETE_ADDON` | addon | delete | root |  |
| `CREATE_CLIENT_API_TOKEN` | client_api_token | create | root |  |
| `READ_CLIENT_API_TOKEN` | client_api_token | read | root |  |
| `UPDATE_CLIENT_API_TOKEN` | client_api_token | update | root |  |
| `DELETE_CLIENT_API_TOKEN` | client_api_token | delete | root |  |
| `CREATE_FRONTEND_API_TOKEN` | frontend_api_token | create | root |  |
| `READ_FRONTEND_API_TOKEN` | frontend_api_token | read | root |  |
| `UPDATE_FRONTEND_API_TOKEN` | frontend_api_token | update | root |  |
| `DELETE_FRONTEND_API_TOKEN` | frontend_api_token | delete | root |  |
| `CREATE_CONTEXT_FIELD` | context_field | create | root |  |
| `UPDATE_CONTEXT_FIELD` | context_field | update | root |  |
| `DELETE_CONTEXT_FIELD` | context_field | delete | root |  |
| `CREATE_PROJECT` | project | create | root |  |
| `READ_ROLE` | role | read | root |  |
| `CREATE_SEGMENT` | segment | create | root |  |
| `UPDATE_SEGMENT` | segment | update | root |  |
| `DELETE_SEGMENT` | segment | delete | root |  |
| `CREATE_STRATEGY` | strategy | create | root |  |
| `UPDATE_STRATEGY` | strategy | update | root |  |
| `DELETE_STRATEGY` | strategy | delete | root |  |
| `CREATE_TAG_TYPE` | tag_type | create | root |  |
| `UPDATE_TAG_TYPE` | tag_type | update | root |  |
| `DELETE_TAG_TYPE` | tag_type | delete | root |  |
| `READ_LOGS` | logs | read | root | Ability to read login logs |
| `UPDATE_MAINTENANCE_MODE` | maintenance_mode | update | root |  |
| `UPDATE_INSTANCE_BANNERS` | instance_banner | update | root |  |
| `UPDATE_CORS` | cors | update | root |  |
| `UPDATE_AUTH_CONFIGURATION` | auth_configuration | update | root |  |
| `UPDATE_APPLICATION` | application | update | root |  |
| `RELEASE_PLAN_TEMPLATE_CREATE` | release_plan_template | create | root |  |
| `RELEASE_PLAN_TEMPLATE_UPDATE` | release_plan_template | update | root |  |
| `RELEASE_PLAN_TEMPLATE_DELETE` | release_plan_template | delete | root |  |
| `UPDATE_PROJECT` | project | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `DELETE_PROJECT` | project | delete | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `CREATE_FEATURE` | feature | create | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `UPDATE_FEATURE` | feature | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `DELETE_FEATURE` | feature | delete | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `UPDATE_FEATURE_VARIANTS` | feature_variant | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `MOVE_FEATURE_TOGGLE` | feature | move | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `READ_PROJECT_API_TOKEN` | client_api_token + frontend_api_token | read | project | Expands to both client and frontend project tokens; legacy string is level-agnostic |
| `CREATE_PROJECT_API_TOKEN` | client_api_token + frontend_api_token | create | project | Expands to both client and frontend project tokens; legacy string is level-agnostic |
| `DELETE_PROJECT_API_TOKEN` | client_api_token + frontend_api_token | delete | project | Expands to both client and frontend project tokens; legacy string is level-agnostic |
| `UPDATE_FEATURE_DEPENDENCY` | feature_dependency | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `UPDATE_PROJECT_SEGMENT` | segment | update | project | Same resource as segments; project-level link/edit. Legacy string is level-agnostic |
| `PROJECT_USER_ACCESS_READ` | project_user_access | read | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_USER_ACCESS_WRITE` | project_user_access | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_DEFAULT_STRATEGY_READ` | project_default_strategy | read | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_DEFAULT_STRATEGY_WRITE` | project_default_strategy | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_CHANGE_REQUEST_READ` | project_settings | read | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_CHANGE_REQUEST_WRITE` | project_settings | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_SETTINGS_READ` | project_settings | read | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `PROJECT_SETTINGS_WRITE` | project_settings | update | project | Assignment qualifiers determine project coverage; legacy string is level-agnostic |
| `CREATE_FEATURE_STRATEGY` | feature_strategy | create | environment | Environment optional → all envs if unset |
| `UPDATE_FEATURE_STRATEGY` | feature_strategy | update | environment | Environment optional → all envs if unset |
| `DELETE_FEATURE_STRATEGY` | feature_strategy | delete | environment | Environment optional → all envs if unset |
| `UPDATE_FEATURE_ENVIRONMENT` | feature_environment | update | environment | Enable/disable; environment optional → all envs if unset |
| `UPDATE_FEATURE_ENVIRONMENT_VARIANTS` | feature_environment | update | environment | Environment optional → all envs if unset |
| `APPLY_CHANGE_REQUEST` | change_request | apply | environment | Environment optional → all envs if unset |
| `APPROVE_CHANGE_REQUEST` | change_request | approve | environment | Environment optional → all envs if unset |
| `SKIP_CHANGE_REQUEST` | change_request | skip | environment | Environment optional → all envs if unset |

## Collision and ambiguity notes

- Every legacy string currently has a single `permissions.type` (root/project/environment); there are no duplicate strings with different types in migrations.
- **One-to-many mapping:** some legacy permissions expand to multiple structured permissions. Example: `CREATE_PROJECT_API_TOKEN` maps to both `(client_api_token, create, project)` and `(frontend_api_token, create, project)`; the adapter should return the union.
- **Shared resources across levels:** some pairs are the same resource at different levels, e.g. `UPDATE_PROJECT_SEGMENT` and `CREATE/UPDATE/DELETE_SEGMENT` all operate on `segment` (project vs root). Treat them as a single `resource` with level differences.
- **Assignment qualifier semantics:** current behavior treats an empty project/environment on an assignment as “all projects/all environments,” which is broader than least-permission defaults. The structured form should preserve this (e.g., `resourceScope=environment` with `environment` unset meaning all envs) to stay faithful to existing semantics while we evolve the model and enable explicit grants at any level (project, environment, project+environment, or unscoped).
- `ADMIN` bypasses the normal model; treat as superuser outside the mapping.
- **Backward compatibility:** carry both legacy strings (deprecated) and structured permissions. Internal code should consume structured permissions.

## Implementation plan

1. Add the mapping table and adapter interfaces under `src/lib/features/rbac/` with exhaustive fixtures that mirror the `permissions` table.
2. Write tests that validate (a) every legacy permission string maps to at least one structured permission (fail if any legacy mapping is missing), and (b) collisions/expansions are explicitly marked as lossy (legacy→structured is one-to-many; structured→legacy collapses).
3. Introduce the adapter at the boundary of access control (`AccessService` / controller responses): domain logic consumes structured permissions; persistence/API surfaces both (legacy as deprecated + structured as canonical).
4. Document consumer guidance towards using the new model (support playbooks) using this file and link it from ADR-XXX once merged.

## Decisions

- Tokens: keep token resources as plain strings (no dedicated `TokenResource` union), so adding a new token type does not require changing a shared enum. The mapping table lists the currently known ones from the `permissions` table.
- ADMIN: keep special handling but modelable as `{ resource: '*', action: '*', resourceScope: 'root' }` to align with the structured shape.
- Transition output: plan to emit both legacy string and structured permission in responses until clients migrate; mark the structured piece as beta/experimental where appropriate.
