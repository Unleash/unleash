import {
    type IReleasePlanMilestonePayload,
    isExposureCondition,
    isTimeCondition,
} from 'interfaces/releasePlans';

export const automationCounts = (
    milestones: Pick<IReleasePlanMilestonePayload, 'transitionCondition'>[],
): { timeAutomations: number; exposureAutomations: number } => {
    const conditions = milestones
        .map(({ transitionCondition }) => transitionCondition)
        .filter((condition) => condition !== undefined);

    return {
        timeAutomations: conditions.filter(isTimeCondition).length,
        exposureAutomations: conditions.filter(isExposureCondition).length,
    };
};
