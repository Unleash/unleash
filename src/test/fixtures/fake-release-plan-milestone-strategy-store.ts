import type { ReleasePlanMilestoneStrategy } from '../../lib/features/release-plans/release-plan-milestone-strategy.js';
import type { MilestoneStrategyColumnUpdate } from '../../lib/features/release-plans/types/release-plan-milestone-strategy-store-type.js';

export class FakeReleasePlanMilestoneStrategyStore {
    async updateWithSegments(
        _strategyId: string,
        _updates: MilestoneStrategyColumnUpdate,
        _segments?: number[],
    ): Promise<ReleasePlanMilestoneStrategy> {
        return {} as ReleasePlanMilestoneStrategy;
    }
}
