import type { ReleasePlanMilestoneStrategy } from '../release-plan-milestone-strategy.js';

export type MilestoneStrategyColumnUpdate = Partial<{
    title: string | null;
    strategy_name: string;
    parameters: Record<string, string>;
    constraints: string;
    variants: string;
}>;

export interface IReleasePlanMilestoneStrategyStore {
    updateWithSegments(
        strategyId: string,
        updates: MilestoneStrategyColumnUpdate,
        segments?: number[],
    ): Promise<ReleasePlanMilestoneStrategy>;
}
