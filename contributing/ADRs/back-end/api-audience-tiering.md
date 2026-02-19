---
title: "ADR: API Audience Tiering"
---

## Background

Our stability lifecycle (alpha/beta/stable) describes how mature an API is, but not who it is meant for. In practice, some stable endpoints are optimized for rapid UI iteration and aren’t ideal for external integrations, even though we still aim for backward compatibility. Meanwhile, other endpoints serve integration-heavy clients (Terraform, Jira, and others in the future) and require stronger guarantees, though they’re not always mission-critical. We also have APIs that underpin our SDKs; these demand the strictest validation and long-term backward compatibility because SDK upgrades can lag by months or years.

Relying on stability alone makes it hard to communicate intent, which creates mismatched expectations for customers and internal teams.

## Decision

Introduce a second, independent classification for intended consumers. We will label endpoints with an **audience** field, separate from stability:

```
audience: 'public' | 'integration' | 'sdk' | 'unleash-ui' | 'internal'
```

**Rationale:**
- Industry usage tends to treat "support level" as a contractual/SLA concept, which can be misleading for customers.
- "Audience" more directly conveys who the endpoint is intended for, and can coexist with stability without implying support guarantees.
- The primary intent of audience is communication and organization of APIs into logical groups for a given purpose, not URL design.
- `public` is our default catch-all bucket for existing or not-yet-classified external endpoints; it is intentionally generic.

This ADR complements the stability lifecycle. Stability still answers **"how mature is it?"**, while audience answers **"who should use it?"**.

**Audience and base URL policy:**
- Audience does **not** require a dedicated base URL.
- We should avoid coupling audience to URL design by default.
- For net-new API surfaces, we may choose a dedicated base URL when it materially improves clarity (for example, `/api/integrations`, `/api/service-now`, or `/api/integrations/service-now`).
- For existing/legacy APIs, backward compatibility constraints mean we generally cannot change established base URLs.
- Creating a dedicated base URL couples audience and URL structure. This can simplify discoverability today, but makes later audience reclassification more expensive.

**Classification rules:**
- Each operation has exactly one audience label.
- The audience label communicates intended use; it does not by itself enforce runtime or architectural isolation.
- Audience changes are generally safe when URL contracts and behavior remain unchanged.
- For audiences requiring stronger guarantees (especially `sdk`/`integration`), we may add explicit architectural boundaries for net-new surfaces (for example dedicated routes, ownership, or stricter review gates).

## Audience definitions

- `public`: General external API surface for customer-built integrations.
- `integration`: Intended for specific supported integrations (Terraform, Jira, etc.). Tailored to those clients.
- `sdk`: Intended for Unleash SDKs. Strictest validation and long-term backward compatibility due to slow SDK upgrade cadence.
- `unleash-ui`: Intended to serve the Unleash UI. May evolve faster; not recommended for external integrations.
- `internal`: Internal-only use. Not intended for customers or integrations; may change without notice.

## Guarantees by audience

- `public`: Strong backward compatibility; breaking changes require formal deprecation policy and long lead time.
- `integration`: Backward compatibility prioritized for the named clients; deprecations are allowed with shorter notice than public.
- `sdk`: Strictest backward compatibility; changes must be carefully reviewed due to long upgrade lag.
- `unleash-ui`: Best-effort backward compatibility; changes can be faster, with lighter communication requirements.
- `internal`: No compatibility guarantees; can change freely.

## Implementation outline

- Add `audience?: 'public' | 'integration' | 'sdk' | 'unleash-ui' | 'internal'` to API metadata.
- Emit `x-audience` in OpenAPI output and surface it in docs.
- Default when omitted: `public`.
- Defaulting to `public` introduces classification debt; teams should reclassify endpoints to a more specific audience (`integration`, `sdk`, or `unleash-ui`) once intent is clear.
- Use a lightweight handover process to move endpoints between audiences as ownership/intent shifts.

## Audience changes (promotion/demotion)

- **Who**: Owning team proposes; API review group (or designated reviewer) approves changes involving `public` or `sdk`.
- **Triggers**: External integration needs, SDK reliance, recurring customer use, or support burden.
- **Allowed moves**: `internal` → `unleash-ui`/`integration`/`sdk`/`public`. Moves away from `public`/`sdk` require explicit review due to customer impact.
- **Not allowed**: Silent demotions of `public`/`sdk` without deprecation and communication.

## Downstream behavior

- `public`: Highlighted in docs; default recommendation for customer integrations.
- `integration`: Visible in docs with an integration-specific note; caution about use outside stated clients.
- `sdk`: Highlighted in SDK-related docs; strong compatibility messaging.
- `unleash-ui`: Visible with a warning badge; discouraged for external integrations.
- `internal`: Hidden from public docs by default (can be shown in dev).

## Consequences

### Positive

- Clearer guidance for customers on what to integrate with.
- Preserves UI velocity without weakening external contracts.
- Supports a path for moving APIs between audiences as intent changes.

### Trade-offs

- Audience labels improve communication and organization, but do not enforce architectural isolation by themselves.
- If we introduce dedicated audience-specific base URLs for net-new surfaces, we gain discoverability but increase audience/URL coupling.
- For legacy endpoints, preserving existing URLs keeps backward compatibility; decoupling audience from URL keeps relabeling simpler over time.

## Open questions

- **Process**: Define criteria, reviewers, and required evidence for moving endpoints into/out of `public` or `sdk`.
- **Governance**: Should we introduce a periodic review of `public` endpoints to reduce long-term catch-all usage?
