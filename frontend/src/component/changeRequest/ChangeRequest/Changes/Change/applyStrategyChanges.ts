import type { IReleasePlan } from 'interfaces/releasePlans';
import type { IChangeRequestUpdateMilestoneStrategy } from 'component/changeRequest/changeRequest.types';

export const applyStrategyChanges = (
    basePlan: IReleasePlan,
    strategyChanges: IChangeRequestUpdateMilestoneStrategy[],
): IReleasePlan => {
    const changeMap = new Map(
        strategyChanges.map((c) => [c.payload.id, c.payload]),
    );

    return {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => ({
            ...milestone,
            strategies: milestone.strategies.map((strategy) => {
                const change = changeMap.get(strategy.id);
                if (change) {
                    const { snapshot, ...rest } = change;
                    return { ...strategy, ...rest };
                }
                return strategy;
            }),
        })),
    };
};
