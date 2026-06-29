import type { IStrategyConfig } from '../types/index.js';

type SortableStrategy = Pick<
    IStrategyConfig,
    'id' | 'milestoneId' | 'sortOrder'
>;

export const sortStrategies = (
    strategy1: SortableStrategy,
    strategy2: SortableStrategy,
): number => {
    if (strategy1.milestoneId && !strategy2.milestoneId) {
        return -1;
    }
    if (!strategy1.milestoneId && strategy2.milestoneId) {
        return 1;
    }

    let sortOrder = 0;
    if (
        typeof strategy1.sortOrder === 'number' &&
        typeof strategy2.sortOrder === 'number'
    ) {
        sortOrder = strategy1.sortOrder - strategy2.sortOrder;
    }
    if (sortOrder === 0 && strategy1.id && strategy2.id) {
        return strategy1.id.localeCompare(strategy2.id);
    }
    return sortOrder;
};
