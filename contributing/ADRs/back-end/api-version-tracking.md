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

We've implemented an automated API stability tracking system based on semantic versioning. Each endpoint declares a `release` object that captures the intended stability milestones. The system calculates stability levels by comparing those milestones against the current version:

### Stability Calculation Heuristic

- **Alpha** 🔴: Current version is before the first milestone.
- **Beta** 🟡: Current version is at/after `release.beta` and before `release.stable` (when both are defined).
- **Stable** 🟢: Current version is at/after `release.stable`, or at/after `release.beta` when only `release.beta` is defined.

Supported release declarations:
- `release: { alpha: true }` → explicitly remain alpha
- `release: { beta: 'x.y.z' }` → alpha → beta
- `release: { stable: 'x.y.z' }` → alpha → stable
- `release: { beta: 'x.y.z', stable: 'a.b.c' }` → alpha → beta → stable (beta must be before stable)

### Developer Guidance (assume current version is 7.4.0)

Prefer to **guess** beta/stable versions up front, even if you might change them later. These labels are hints for users, so adjusting them is low-risk. If you postpone the decision (e.g., only `alpha: true` or only `beta` with no `stable`), the API often stays in beta forever. A conservative future guess is usually better than no guess at all, and you can always revise it later.

- `release` is required for new endpoints. It is not enforced yet, but will be once existing endpoints are backfilled.
- `release: { beta: 'x.y.z' }` → alpha until beta, then beta thereafter.
- `release: { stable: 'x.y.z' }` → alpha until stable, then stable thereafter.
- `release: { beta: 'x.y.z', stable: 'a.b.c' }` → alpha → beta → stable (beta must be before stable).
- `release: { alpha: true }` → explicitly remain alpha.

**Examples:**
```typescript
// Current Unleash version: 7.4.0
openApiService.validPath({
   summary: 'Beta today',
   release: { beta: '7.1.0' },
})

openApiService.validPath({
   summary: 'Beta now, stable later',
   release: { beta: '7.3.0', stable: '7.6.0' },
})

openApiService.validPath({
   summary: 'Alpha now, then stable',
   release: { stable: '7.6.0' },
})

openApiService.validPath({
   summary: 'Alpha now, then beta, then stable',
   release: { beta: '7.6.0', stable: '7.7.0' },
})

openApiService.validPath({
   summary: 'Alpha until changed',
   release: { alpha: true },
})
```

### Implementation

1. **ApiOperation Interface**: Added `release: StabilityRelease` to declare the stability milestones. Legacy operations are temporarily tolerated without `release` to allow backfill.
2. **Stability Calculation**: `calculateStability()` compares the `release` milestones with the current Unleash version.
3. **OpenAPI Extensions**: Adds only `x-stability-level` to the OpenAPI spec (milestones stay in code as documentation).
4. **Swagger UI Integration**: 
   - Alpha endpoints are hidden from public docs in production
   - Visible in development mode (`NODE_ENV=development`)
   - Stability prefix added to endpoint summaries (e.g., `[BETA] List projects`)

### Legacy Backfill Window

Until all endpoints are updated to include `release`, we treat missing milestones as **stable** for versions **before 7.7.7**, and **alpha** starting at **7.7.7**. This is a temporary compatibility window to avoid reclassifying existing APIs while we backfill.

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

1. **Immediate**: New endpoints must include `release` as needed
2. **Gradual**: Add `release` to existing endpoints as they're modified
3. **Future**: AI-assisted bulk backfill from git history to document all existing APIs
4. **Tag cleanup**: Remove legacy `Unstable` OpenAPI tags and replace them with stability cutoffs plus an appropriate existing tag
5. **Enforcement**: `release` property becomes mandatory.

### Trade-offs

**Milestone guessing optional**: Developers can estimate beta/stable milestones during development or do it before a release. Changing an estimate is acceptable because this information is not published. The benefit of guessing is that it automates the stage transitioning, while doing it before a release requires manual changes.

**Explicit lifecycle**: Cutoffs are explicit, but they require setting (and occasionally updating) the versions.
