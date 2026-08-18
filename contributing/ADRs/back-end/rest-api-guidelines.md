---
title: "ADR: REST API Guidelines"
---

## Background

This ADR captures the conventions we want new endpoints to follow. It applies to new work. Reshaping an existing endpoint is a breaking change for its consumers, so bringing an older endpoint into line usually means shipping a new endpoint alongside it and deprecating the old one.

For request-body conventions (handling `undefined` vs `null` on POST/PUT), see [POST/PUT API payload](/contributing/ADRs/back-end/POST-PUT-api-payload). For response-schema precision, see [Separation of request and response schemas](/contributing/ADRs/overarching/separation-request-response-schemas).

## Decision

General guidelines for new API endpoints. It's fine to do something different if your requirements are not typical, but it's what most new endpoints should default to.

### URL structure

Pick the prefix that matches the audience of the new endpoint

* `/api/client` — server SDKs evaluating flags. Public, stable.
* `/api/frontend` — browser SDKs evaluating flags. Public, stable.
* `/edge` — Unleash Edge.
* `/api/integration/*` — new integrations.
* `/api/ui` — new UI-only endpoints.
* `/api/admin` — documented public API.

Other prefixes exist for context, but new endpoints should not add to them:

* `/api/signal-endpoint` — external webhooks calling into Unleash (integration).
* `/scim` — SCIM 2.0 user provisioning (integration).
* `/health`, `/ready`, `/internal-backstage` — operational endpoints for orchestrators and monitoring.
* `/auth/*`, `/invite`, `/logout`, `/feedback` — public browser flows.

Stability within any prefix is signalled by the `release: { alpha | beta | stable }` field — alpha endpoints are hidden from public docs. See [API Version Tracking and Stability Lifecycle](/contributing/ADRs/back-end/api-version-tracking). Prefix says who the endpoint is for; `release` says how stable it is.

Prefer purpose-built endpoints for specific UI needs over stretching a generic endpoint with a narrow filter. A dedicated endpoint documents intent, keeps its response shape minimal, and can be optimized independently. See [Write model vs Read models](/contributing/ADRs/back-end/write-model-vs-read-models) for the internal read/write split this endpoint pattern reflects.

### Shadowing dynamic path segments

If a route like `/api/admin/projects/:projectId` exists, a sibling `/api/admin/projects/some-word` forces `some-word` to become a reserved project id — we depend on the router matching the static route first. That reservation lives only in route registration order: reorder the controllers and the collision reappears, and each new sibling silently reserves some `:id` values that existing data may already contain.

What to do:

* Default: use a top-level sibling (`/api/admin/users-access-log` rather than `/api/admin/users/access-log`). It keeps the parent namespace free and avoids the reserved-id problem entirely.
* Long term, we may adopt `-` as a reserved segment for collection-level operations under a dynamic parent (e.g. `/api/admin/users/-/access-log`), following [Google AIP-159](https://google.aip.dev/159). We are not there yet — do not introduce it ad-hoc. If you have a case that would benefit, raise it so we can adopt the convention deliberately.
* Stop using shadowing. Existing cases stay as-is — we are not migrating. Treat it as legacy: don't extend it just because a similar endpoint already lives under the same collection. Every new sibling adds another implicit reserved id. E.g.:
  * `/api/admin/user-admin/:id`
  * `/api/admin/user-admin/search`
  * `/api/admin/user-admin/validate-password`
  * `/api/admin/segments/validate`

### Naming conventions

* Use `kebab-case` for the static parts e.g.: 
  * `/api/admin/release-plan-templates`
  * `/api/admin/projects/default/environments/${environment}/change-requests`
* Use `camelCase` for query string parameters e.g.:
  * `strategyId`
  * `variantForFlag`
* Use `camelCase` for response body fields e.g.:
  * `hasMore`
  * `flagCreators`

### List response shape

* Return an object envelope, not a bare array:

```json
{
    "items": [ ... ]
}
```
* This makes it easier to extend the response without breaking the API. E.g.: to add pagination metadata (`total`, `hasMore`, cursors).

```json
{
    "total": 2000,
    "items": [ ... ]
}
```
* Name the collection field after the resource (`users`, `flagCreators`, `events`) rather than a generic `data`. It reads better at call sites and matches existing endpoints.
* New list endpoints should have a `limit` by default. 
  * While adding `limit` it usually makes sense to add [Pagination](#pagination).
  * But, if you're not adding pagination (even though you should) then think of some other way to get the data beyond the limit — see [Query parameter conventions](#query-parameter-conventions) for the standard sort and filter names.
* Endpoints should set a `maxLimit`. Always return the applied `total`, `limit`, and `offset` in the response — even when the caller did not paginate — so the envelope stays consistent and callers can see what was actually used. E.g.: a request for `limit=10000000` may still return max `1000` items.

```json
{
    "total": 2000,
    "limit": 1000,
    "offset": 0,
    "items": [ ... ]
}
```

### Pagination

* Because new list endpoints should have a `limit` by default, users need some way of getting values past the limit e.g.: `Load more` or see `page 2` of the data. 
* New list endpoints should paginate by default. It is much cheaper to opt in from day one than to retrofit an endpoint whose clients rely on receiving the full list in one call.
* Default to offset/limit with `?offset=` and `?limit=`, and include `total` in the response so the UI can render counts and page controls.
* Choose cursor-based pagination (`?cursor=` + `hasMore`) only when stability across pages matters more than a known `total` — for example, endpoints served from a rapidly changing feed.
* Do not skip pagination because "the list will be short". Instances vary; assumptions about size that hold for one customer routinely fail for another. Response size is not always the limiting factor; sometimes DB load may force us to introduce a limit. 

### Query parameter conventions

Reuse existing names before inventing new ones:

* `?q=` — free-text search across the natural user-visible fields (typically name/username/email for user-shaped endpoints). Do not require a minimum length; an empty `q` should behave the same as omitting it.
* `?offset=` / `?limit=` — pagination controls.
* `?sortBy=` / `?sortOrder=asc|desc` — sorting. Each endpoint documents its allowed `sortBy` values and its default; `sortOrder` defaults to `asc`.
* `?field=IS:value` — field-specific filters via the shared generic-query-params helper. Prefer this over one-off boolean flags or bespoke parameter names.

### Return only what the caller needs

Design the response shape for the specific use case. Do not return the full internal model on the theory that clients can "just pick what they want". It's way harder to remove problematic fields than add them when needed.

Every field adds wire cost and couples the client to the internal shape. If the UI does not render a field, do not return it.

If callers legitimately need different amounts of data from the same list, prefer separate endpoints over a `?view=minimal|full` parameter — dedicated endpoints stay simpler to reason about and cache.

This is the response-side counterpart to [Separation of request and response schemas](/contributing/ADRs/overarching/separation-request-response-schemas): responses are tight and precise; request schemas can be more forgiving.

### Filter in SQL, not JS

* Do all row-level filtering in the SQL query, including any fallback logic ("skip rows with no name, username, or email"). Do not filter after the query has returned.
* Post-query filtering breaks pagination in two ways: `limit=100` can return fewer than 100 rows, and `total` no longer matches what the caller sees. This is not a corner case — it is the normal behavior any time the filter removes at least one row on the current page.

## Consequences

### Positive

* New list endpoints paginate by default and behave the same way from the caller's perspective.
* Frontend and API consumers can predict the query params for search, pagination, and sorting without reading each endpoint's docs.
* Response shapes stay small and intentional; changing an internal model does not automatically change the API surface.
* Filtering behavior is consistent with pagination metadata, so the UI can trust `total` and page sizes.

### Trade-offs

* Purpose-built endpoints multiply endpoint count compared to a single generic endpoint with many filters. We accept this in exchange for smaller responses and clearer intent.
* Enveloping list responses is a breaking change for endpoints that currently return bare arrays. This convention applies to new endpoints; migrating an existing one means adding a new endpoint and deprecating the old. This plan assumes we leave the existing endpoints as is making them inconsistent with our new guidelines. 
* Pushing all filtering into SQL sometimes means more complex queries (e.g. `COALESCE` for fallback columns). We accept the query complexity in exchange for correct pagination.