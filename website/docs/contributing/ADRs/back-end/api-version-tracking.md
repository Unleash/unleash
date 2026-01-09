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

We've implemented an automated API stability tracking system based on semantic versioning. Each endpoint declares a `releaseVersion` field (the version when it was introduced or last significantly changed). The system automatically calculates stability levels based on version comparison:

### Stability Calculation Heuristic

- **Alpha** 🔴: Release version is ahead of current version (not yet released)
- **Beta** 🟡: Current version is 1-2 minor versions ahead of release version
- **Stable** 🟢: Current version is 3+ minor versions ahead of release version

**Example:**
```typescript
// Current Unleash version: 7.4.0

openApiService.validPath({
    tags: ['Features'],
    summary: 'Create feature flag',
    releaseVersion: '7.5.0',  // → Alpha (not yet released)
    operationId: 'createFeature',
    // ...
})

openApiService.validPath({
    tags: ['Projects'],
    summary: 'List projects',
    releaseVersion: '7.3.0',  // → Beta (1 minor behind)
    operationId: 'getProjects',
    // ...
})

openApiService.validPath({
    tags: ['Users'],
    summary: 'Get user info',
    releaseVersion: '7.1.0',  // → Stable (3+ minors behind)
    operationId: 'getUserInfo',
    // ...
})
```

### Implementation

1. **ApiOperation Interface**: Added `releaseVersion?: string` field (defaults to `'7.0.0'` so most/all APIs are stable now)
2. **Stability Calculation**: `calculateStability()` function compares release version with current Unleash version
3. **OpenAPI Extensions**: Automatically adds `x-stability-level` and `x-release-version` (only if defined) to OpenAPI spec
4. **Swagger UI Integration**: 
   - Alpha endpoints are hidden from public docs in production
   - Visible in development mode (`NODE_ENV=development`)
   - Stability prefix added to endpoint summaries (e.g., `[BETA] List projects`)

### Alpha API Behavior

Alpha endpoints are **automatically hidden** from the public OpenAPI docs (`/docs/openapi`) in production. This means:

- ✅ **APIs are still fully functional** - clients can use them if they know the endpoint
- 📖 **Not advertised publicly** - they don't appear in the documentation portal
- 🔍 **Visible in development** - when `NODE_ENV=development`, all alpha endpoints show up for internal testing

This gives us the best of both worlds: we can ship and test alpha APIs internally or with select customers without formally documenting them, reducing support burden and managing expectations for unstable features.

## Consequences

### Positive

**Zero maintenance**: As Unleash versions progress, APIs automatically transition from alpha → beta → stable without manual intervention.

**Built-in documentation**: The `releaseVersion` field serves as historical documentation. Anyone can see when an API was introduced and assess its maturity.

**Flexible during development**: Developers estimate which version a new API will ship in. If priorities change or development takes longer, they simply update the version - it's okay to be wrong initially.

**Selective disclosure**: Ship alpha features to production for testing with select customers without exposing them in public documentation.

**Consistency**: Every API follows the same maturity progression, eliminating confusion about stability levels.

### Migration Path

1. **Immediate**: New endpoints should include `releaseVersion`
2. **Gradual**: Add `releaseVersion` to existing endpoints as they're modified
3. **Future**: AI-assisted bulk backfill from git history to document all existing APIs

### Trade-offs

**Version guessing required**: Developers must estimate release versions during development. This is an acceptable trade-off given the version can be updated and the benefits of automation.

**Defaults to 7.0.0**: Endpoints without `releaseVersion` default to `'7.0.0'`, which may not be historically accurate but provides a reasonable baseline for the migration period.

**Heuristic limitations**: The 2-minor-version threshold for beta→stable is somewhat arbitrary but provides a reasonable balance between caution and API maturity progression.
