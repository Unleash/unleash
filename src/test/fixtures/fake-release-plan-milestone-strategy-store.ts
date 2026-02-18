import type { ReleasePlanMilestoneStrategy } from '../../lib/features/release-plans/release-plan-milestone-strategy.js';
import type { IReleasePlanMilestoneStrategyStore } from '../../lib/features/release-plans/release-plan-milestone-strategy-store.js';
import type { MilestoneStrategyConfig } from '../../lib/types/model.js';

export class FakeReleasePlanMilestoneStrategyStore
    implements IReleasePlanMilestoneStrategyStore
{
    private items: ReleasePlanMilestoneStrategy[] = [];

    async insert(
        _item: Omit<ReleasePlanMilestoneStrategy, 'id'>,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const strategy = {
            ..._item,
            id: String(this.items.length + 1),
        } as ReleasePlanMilestoneStrategy;
        this.items.push(strategy);
        return strategy;
    }

    async update(
        id: string,
        item: Partial<Omit<ReleasePlanMilestoneStrategy, 'id'>>,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const idx = this.items.findIndex((s) => s.id === id);
        if (idx >= 0) {
            this.items[idx] = { ...this.items[idx], ...item };
            return this.items[idx];
        }
        return {} as ReleasePlanMilestoneStrategy;
    }

    async upsert(
        _strategyId: string,
        _strategy: MilestoneStrategyConfig,
    ): Promise<ReleasePlanMilestoneStrategy> {
        return {} as ReleasePlanMilestoneStrategy;
    }

    async deleteStrategiesForMilestone(_milestoneId: string): Promise<void> {
        this.items = this.items.filter((s) => s.milestoneId !== _milestoneId);
    }

    async get(key: string): Promise<ReleasePlanMilestoneStrategy | undefined> {
        return this.items.find((s) => s.id === key);
    }

    async getAll(): Promise<ReleasePlanMilestoneStrategy[]> {
        return this.items;
    }

    async exists(key: string): Promise<boolean> {
        return this.items.some((s) => s.id === key);
    }

    async delete(key: string): Promise<void> {
        this.items = this.items.filter((s) => s.id !== key);
    }

    async deleteAll(): Promise<void> {
        this.items = [];
    }

    destroy(): void {}
}
