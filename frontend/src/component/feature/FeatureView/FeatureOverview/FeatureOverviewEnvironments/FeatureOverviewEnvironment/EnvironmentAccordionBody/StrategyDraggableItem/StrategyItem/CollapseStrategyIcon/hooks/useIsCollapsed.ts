import { useCollapsedStrategies } from './useCollapsedStrategies';

export const useIsCollapsed = (strategyId: string | undefined) => {
    const { collapsedStrategies } = useCollapsedStrategies();

    if (!strategyId) return false;

    return collapsedStrategies.has(strategyId);
};
