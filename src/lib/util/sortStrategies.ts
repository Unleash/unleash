import type { IStrategyConfig } from '../types/index.js';

type SortableStrategy = Pick<IStrategyConfig, 'milestoneId' | 'sortOrder'>;

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

    if (
        typeof strategy1.sortOrder === 'number' &&
        typeof strategy2.sortOrder === 'number'
    ) {
        return strategy1.sortOrder - strategy2.sortOrder;
    }
    return 0;
};
