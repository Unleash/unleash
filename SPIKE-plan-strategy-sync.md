# Spike: Release Plan Strategy Sync

## Overview

When a feature strategy is updated and it has a `milestoneId` (meaning it originated from a release plan), we need to sync the changes back to the corresponding `milestone_strategies` record to keep both tables in sync.

## Data Model

```
milestone_strategies (definition)         feature_strategies (runtime)
├── id (ULID) ─────────────────────────── id (same ID!)
├── milestone_id                          ├── milestone_id
├── strategy_name                         ├── strategy_name
├── parameters                            ├── parameters
├── constraints                           ├── constraints
├── variants                              ├── variants
├── title                                 ├── title
└── sort_order                            └── sort_order

milestone_strategy_segments               feature_strategy_segment
├── milestone_strategy_id                 ├── feature_strategy_id
└── segment_id                            └── segment_id
```

## Scenario Matrix

| Scenario | feature_strategies | milestone_strategies | What happens |
|----------|-------------------|---------------------|--------------|
| Feature strategy found, no milestoneId | ✅ exists | N/A | Update feature_strategies only |
| Feature strategy found, has milestoneId | ✅ exists | ✅ exists | Update both in transaction ✅ |
| Feature strategy not found, milestone exists | ❌ missing | ✅ exists | Update milestone_strategies only ✅ |
| Strategy not found anywhere | ❌ missing | ❌ missing | NotFoundError |

### Scenario Details

1. **Feature strategy without milestone** - Normal strategy, just update `feature_strategies`
2. **Feature strategy with milestone** - Release plan strategy that's been activated, update both atomically
3. **Milestone not activated yet** - Strategy only exists in `milestone_strategies`, update it directly
4. **Not found anywhere** - Error case, strategy doesn't exist in either table

## Change Request Flow

When CRs are enabled and applied:
1. User creates CR with `updateStrategy` action
2. CR is approved
3. `change-request-executor.ts` calls `featureToggleService.unprotectedUpdateStrategy()`
4. Our sync logic runs - both tables updated in transaction
5. `FEATURE_STRATEGY_UPDATE` event emitted
6. Conflict detector handles any scheduled CR conflicts

**No changes needed in unleash-enterprise** - the CR executor already calls `unprotectedUpdateStrategy()` which contains our sync logic.

## Changes Made

### unleash repo

#### 1. [feature-toggle-strategies-store.ts](src/lib/features/feature-toggle/feature-toggle-strategies-store.ts)
- Added `getDb()` method to expose database connection for transactions
- Modified `updateStrategy()` to accept optional `trx` parameter

#### 2. [feature-toggle-strategies-store-type.ts](src/lib/features/feature-toggle/types/feature-toggle-strategies-store-type.ts)
- Updated interface with `getDb()` and optional `trx` on `updateStrategy()`

#### 3. [release-plan-milestone-strategy-store.ts](src/lib/features/release-plans/release-plan-milestone-strategy-store.ts)
- Added `updateWithSegments(strategyId, data, segmentIds, trx?)` method
- Accepts optional transaction; creates new one if not provided

#### 4. [feature-toggle-service.ts](src/lib/features/feature-toggle/feature-toggle-service.ts)
- Added optional `ReleasePlanMilestoneStrategyStore` dependency
- In `unprotectedUpdateStrategy`, when strategy has `milestoneId`:
  - Uses `db.transaction()` to wrap both updates atomically
- Modified `getStrategy()` to also check `milestone_strategies` if not found in `feature_strategies`
  - This enables Change Requests for non-activated milestone strategies (enterprise code calls `getStrategy()` to capture snapshots)

#### 5. [createFeatureToggleService.ts](src/lib/features/feature-toggle/createFeatureToggleService.ts)
- Creates and wires up `ReleasePlanMilestoneStrategyStore`

#### 6. [fake-feature-strategies-store.ts](src/lib/features/feature-toggle/fakes/fake-feature-strategies-store.ts)
- Added stub `getDb()` for interface compliance

### unleash-enterprise repo

**No changes needed** - existing CR flow calls `unprotectedUpdateStrategy()` which contains our sync logic.

## Testing

To test:
1. Create a release plan with a strategy
2. Activate the milestone (strategy copied to `feature_strategies`)
3. Edit the strategy via the regular strategy edit endpoint
4. Verify both `feature_strategies` and `milestone_strategies` have the updated values
5. Verify both segments tables are in sync

### CR Testing (Activated Milestone)
1. Enable change requests for an environment
2. Create a release plan and activate milestone
3. Create a CR to update the strategy
4. Approve and apply the CR
5. Verify both tables are updated

### CR Testing (Non-Activated Milestone)
1. Enable change requests for an environment
2. Create a release plan with a strategy (do NOT activate the milestone)
3. Create a CR to update the milestone strategy (using its ID)
4. Approve and apply the CR
5. Verify `milestone_strategies` is updated (no `feature_strategies` entry should exist)

## Notes

- **Atomic updates**: Feature strategy and milestone strategy updates wrapped in single DB transaction
- Feature strategy segments updated via segment service (outside transaction - future improvement)
- CRs work automatically - they call `unprotectedUpdateStrategy` which has our sync logic
- Conflict detection works - `FEATURE_STRATEGY_UPDATE` event triggers existing conflict detector
- **Event emission**: `FEATURE_STRATEGY_UPDATE` is emitted for both activated and non-activated milestone strategy updates

## Future Work

- Including feature_strategy_segment updates in the transaction
- Flag to enable/disable milestone sync
