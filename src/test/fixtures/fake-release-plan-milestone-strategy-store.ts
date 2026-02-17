import type { ReleasePlanMilestoneStrategy } from '../../lib/features/release-plans/release-plan-milestone-strategy.js';
import type { MilestoneStrategyConfig } from '../../lib/types/model.js';

export class FakeReleasePlanMilestoneStrategyStore {
    async upsert(
        _strategyId: string,
        _strategy: MilestoneStrategyConfig,
    ): Promise<ReleasePlanMilestoneStrategy> {
        return {} as ReleasePlanMilestoneStrategy;
    }
}
