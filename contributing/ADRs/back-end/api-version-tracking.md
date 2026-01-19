---
title: "ADR: API Version Tracking and Stability Lifecycle"
---

## Background

Our OpenAPI documentation lacked a systematic way to communicate API maturity and stability to users. We had no automated mechanism to:
- Track when APIs were introduced
- Communicate stability levels (alpha, beta, stable) to API consumers
- Filter unreleased APIs from public documentation
- Provide historical context about API evolution

Manually maintaining stability levels was error-prone and often forgotten. APIs would remain marked as "beta" indefinitely, or lack any stability indicator altogether. This created confusion for both internal developers and external API consumers about which endpoints were production-ready.

Additionally, we wanted to ship and test new APIs with select customers before formally documenting them, but had no way to hide alpha/unreleased features from public docs while keeping them functionally available.

## Decision

We've implemented an automated API stability tracking system based on semantic versioning. Each endpoint declares a `betaReleaseVersion` (optional) and a `stableReleaseVersion` (required). The system calculates stability levels by comparing those milestones against the current version:

### Stability Calculation Heuristic

- **Alpha** 🔴: Current version is before beta (when beta is defined)
- **Beta** 🟡: Current version is at or after beta, but before stable
- **Stable** 🟢: Current version is at or after stable

**Example:**
```typescript
// Current Unleash version: 7.4.0

openApiService.validPath({
    tags: ['Features'],
    summary: 'Create feature flag',
    betaReleaseVersion: '7.5.0',
    stableReleaseVersion: '7.7.0', // → Alpha (not yet released)
    operationId: 'createFeature',
    // ...
})

openApiService.validPath({
    tags: ['Projects'],
    summary: 'List projects',
    betaReleaseVersion: '7.3.0',
    stableReleaseVersion: '7.5.0', // → Beta (between beta and stable)
    operationId: 'getProjects',
    // ...
})

openApiService.validPath({
    tags: ['Users'],
    summary: 'Get user info',
    stableReleaseVersion: '7.1.0', // → Stable (already at/after stable)
    operationId: 'getUserInfo',
    // ...
})
```

### Implementation

1. **ApiOperation Interface**: Added `betaReleaseVersion?: string` and `stableReleaseVersion?: string` (defaults to `'7.0.0'` so most/all APIs are stable now)
2. **Stability Calculation**: `calculateStability()` compares beta/stable milestones with the current Unleash version
3. **OpenAPI Extensions**: Adds only `x-stability-level` to the OpenAPI spec (milestone versions stay in code as documentation)
4. **Swagger UI Integration**: 
   - Alpha endpoints are hidden from public docs in production
   - Visible in development mode (`NODE_ENV=development`)
   - Stability prefix added to endpoint summaries (e.g., `[BETA] List projects`)

### Alpha API Behavior

Alpha endpoints are **automatically hidden** from the public OpenAPI docs (`/docs/openapi`) in production. This means:

- ✅ **APIs are still fully functional** - clients can use them if they know the endpoint
- 📖 **Not advertised publicly** - they don't appear in the documentation portal
- 🔍 **Visible in development** - when `NODE_ENV=development`, all alpha endpoints show up for internal testing

This gives us the best of both worlds: we can ship and test alpha APIs internally without formally documenting them, reducing support burden and managing expectations for unstable features.

## Consequences

### Positive

**Zero maintenance**: As Unleash versions progress, APIs automatically transition from alpha → beta → stable based on the declared milestones.

**Built-in documentation**: The `betaReleaseVersion` and `stableReleaseVersion` fields serve as historical documentation. Anyone can see the intended lifecycle and assess maturity.

**Flexible during development**: Developers estimate which versions a new API will reach beta and stable. If priorities change or development takes longer, they update the milestones.

**Selective disclosure**: Ship alpha features to production for testing without exposing them to customers, until the API is ready to be moved to beta.

**Consistency**: Every API follows the same maturity progression, eliminating confusion about stability levels.

### Migration Path

1. **Immediate**: New endpoints should include `stableReleaseVersion` and optionally `betaReleaseVersion` (omit beta if you want beta until stable)
2. **Gradual**: Add `stableReleaseVersion` (and optional `betaReleaseVersion`) to existing endpoints as they're modified
3. **Future**: AI-assisted bulk backfill from git history to document all existing APIs

### Trade-offs

**Milestone guessing required**: Developers must estimate beta/stable milestones during development. This is acceptable given the milestones can be updated.

**Defaults to 7.0.0**: Endpoints without `stableReleaseVersion` default to `'7.0.0'`, which may not be historically accurate but provides a reasonable baseline for the migration period.

**Explicit lifecycle**: Having two milestones is explicit, but it requires setting (and occasionally updating) both values.
