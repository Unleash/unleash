import type {
    IReleasePlan,
    IReleasePlanMilestone,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import type {
    ChangeRequestUpdateMilestoneStrategy,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';

type ProgressionChange =
    | IChangeRequestChangeMilestoneProgression
    | IChangeRequestDeleteMilestoneProgression;

const mergeStrategyWithoutSnapshot = (
    strategy: IReleasePlanMilestoneStrategy,
    change: Partial<ChangeRequestUpdateMilestoneStrategy> = {},
): IReleasePlanMilestoneStrategy => {
    const { snapshot: _, ...updates } = change;
    return { ...strategy, ...updates };
};

const applyStrategyChanges = (
    milestoneStrategies: IReleasePlanMilestoneStrategy[],
    strategyChanges: IChangeRequestUpdateMilestoneStrategy[],
): IReleasePlanMilestoneStrategy[] => {
    const changeMap = new Map(
        strategyChanges.map((c) => [c.payload.id, c.payload]),
    );
    return milestoneStrategies.map((strategy) => {
        return mergeStrategyWithoutSnapshot(
            strategy,
            changeMap.get(strategy.id),
        );
    });
};

const isStrategyChange = (
    change: ProgressionChange | IChangeRequestUpdateMilestoneStrategy,
): change is IChangeRequestUpdateMilestoneStrategy =>
    change.action === 'updateMilestoneStrategy';

export const applyProgressionChanges = (
    basePlan: IReleasePlan,
    changes: (ProgressionChange | IChangeRequestUpdateMilestoneStrategy)[],
): IReleasePlan => {
    return {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            const changeProgression = changes.find(
                (change): change is IChangeRequestChangeMilestoneProgression =>
                    change.action === 'changeMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );
            const deleteChange = changes.find(
                (change): change is IChangeRequestDeleteMilestoneProgression =>
                    change.action === 'deleteMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );

            let updates: Partial<IReleasePlanMilestone> = {
                strategies: applyStrategyChanges(
                    milestone.strategies,
                    changes.filter(isStrategyChange),
                ),
            };

            if (deleteChange) {
                updates = { ...updates, transitionCondition: null };
            }

            if (changeProgression) {
                updates = {
                    ...updates,
                    transitionCondition:
                        changeProgression.payload.transitionCondition,
                };
            }

            return { ...milestone, ...updates };
        }),
    };
};
