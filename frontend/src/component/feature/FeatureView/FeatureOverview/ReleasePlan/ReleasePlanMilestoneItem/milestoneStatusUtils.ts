import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

export const calculateMilestoneStatus = (
    milestone: IReleasePlanMilestone,
    activeMilestoneId: string | undefined,
    index: number,
    activeIndex: number,
    environmentIsDisabled: boolean | undefined,
): MilestoneStatus => {
    if (milestone.id === activeMilestoneId) {
        return environmentIsDisabled ? 'paused' : 'active';
    }

    if (index < activeIndex) {
        return 'completed';
    }

    return 'not-started';
};
