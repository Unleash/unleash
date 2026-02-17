import type { ReleasePlanMilestoneStrategy } from '../../lib/features/release-plans/release-plan-milestone-strategy.js';
import type { IStrategyConfig } from '../../lib/types/model.js';

export class FakeReleasePlanMilestoneStrategyStore {
    async upsert(
        _strategyId: string,
        _strategy: IStrategyConfig & { strategyName: string },
    ): Promise<ReleasePlanMilestoneStrategy> {
        return {} as ReleasePlanMilestoneStrategy;
    }
}
