---
title: "ADR: API Audience Tiering"
---

## Background

Our stability lifecycle (alpha/beta/stable) describes how mature an API is, but not who it is meant for. In practice, some stable endpoints are optimized for UI iteration and are not ideal for external integrations, even though we still aim for backward compatibility. Meanwhile, other endpoints serve integration-heavy clients (Terraform, Jira and others in the future) and require stronger guarantees and longer deprecation windows.

Relying on stability alone makes it hard to communicate intent, which creates mismatched expectations for customers and internal teams.

## Decision

Introduce a second, independent classification for intended consumers. We will label endpoints with an **audience** field, separate from stability:

```
audience: 'core' | 'integration' | 'ui' | 'internal'
```

Rationale:
- Industry usage tends to treat "support level" as a contractual/SLA concept, which can be misleading for customers.
- "Audience" more directly conveys who the endpoint is intended for, and can coexist with stability without implying support guarantees.

This ADR complements the stability lifecycle. Stability still answers **"how mature is it?"**, while audience answers **"who should use it?"**.

## Implementation outline

- Add `audience?: 'core' | 'integration' | 'ui' | 'internal'` to API metadata.
- Emit `x-audience` in OpenAPI output and surface it in docs.
- Default when omitted: `internal` to avoid accidental promotion.
- Use a lightweight promotion process to move endpoints from `ui`/`integration` to `core`.

## Examples

- `stable + ui`: stable but optimized for UI iteration; not recommended for external integrations
- `stable + integration`: stable for integration clients, but not necessarily core/long-term
- `stable + core`: strong compatibility guarantees and longer deprecation windows

## Consequences

### Positive

- Clearer guidance for customers on what to integrate with.
- Preserves UI velocity without weakening external contracts.
- Supports a path for promoting APIs from UI/integration to core.

## Open questions

- **Naming**: Use `audience` or `supportLevel`? "Support level" may imply SLA commitments; confirm with CTO/sales.
- **Default**: What should the default audience be if not specified? Suggestion is: `internal`
- **Promotion**: What criteria and process should govern promotion to `core`?
