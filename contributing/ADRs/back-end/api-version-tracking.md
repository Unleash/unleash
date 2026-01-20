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

We've implemented an automated API stability tracking system based on semantic versioning. Each endpoint can declare an `alphaUntilVersion` and/or a `betaUntilVersion` to define cutoffs. The system calculates stability levels by comparing those cutoffs against the current version:

### Stability Calculation Heuristic

- **Alpha** 🔴: Current version is before `alphaUntilVersion` (when defined)
- **Beta** 🟡: Current version is at or after `alphaUntilVersion` but before `betaUntilVersion` (when defined)
- **Stable** 🟢: Current version is at or after `betaUntilVersion` (when defined); if `betaUntilVersion` is omitted, stability is reached once alpha is no longer in effect (or immediately if `alphaUntilVersion` is also omitted)

**Example:**
```typescript
// Current Unleash version: 7.4.0

openApiService.validPath({
    tags: ['Features'],
    summary: 'Create feature flag',
    alphaUntilVersion: '7.5.0',
    betaUntilVersion: '7.7.0', // → Alpha (not yet released)
    operationId: 'createFeature',
    // ...
})

openApiService.validPath({
    tags: ['Projects'],
    summary: 'List projects',
    alphaUntilVersion: '7.3.0',
    betaUntilVersion: '7.5.0', // → Beta (between alpha and beta cutoffs)
    operationId: 'getProjects',
    // ...
})

openApiService.validPath({
    tags: ['Users'],
    summary: 'Get user info',
    betaUntilVersion: '7.1.0', // → Stable (already at/after beta cutoff)
    operationId: 'getUserInfo',
    // ...
})
```

### Implementation

1. **ApiOperation Interface**: Added `alphaUntilVersion?: string` and `betaUntilVersion?: string` (omit both to mark stable). `releaseVersion?: string` is available for documentation only.
2. **Stability Calculation**: `calculateStability()` compares alpha/beta cutoffs with the current Unleash version
3. **OpenAPI Extensions**: Adds only `x-stability-level` to the OpenAPI spec (cutoff versions stay in code as documentation)
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

**Built-in documentation**: The cutoff versions (and optional `releaseVersion`) serve as lifecycle documentation. Anyone can see the intended lifecycle and assess maturity.

**Flexible during development**: Developers estimate which versions a new API will reach beta and stable. If priorities change or development takes longer, they update the milestones.

**Selective disclosure**: Ship alpha features to production for testing without exposing them to customers, until the API is ready to be moved to beta.

**Consistency**: Every API follows the same maturity progression, eliminating confusion about stability levels.

### Migration Path

1. **Immediate**: New endpoints can include `alphaUntilVersion` and/or `betaUntilVersion` as needed
2. **Gradual**: Add cutoffs to existing endpoints as they're modified
3. **Future**: AI-assisted bulk backfill from git history to document all existing APIs

### Trade-offs

**Milestone guessing required**: Developers must estimate beta/stable milestones during development. This is acceptable given the milestones can be updated.

**Explicit lifecycle**: Cutoffs are explicit, but they require setting (and occasionally updating) the versions.
