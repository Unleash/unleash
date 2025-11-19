import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { calculateMilestoneStartTime } from '../utils/calculateMilestoneStartTime.js';

export const calculateMilestoneStatus = (
    milestone: IReleasePlanMilestone,
    activeMilestoneId: string | undefined,
    index: number,
    activeIndex: number,
    environmentIsDisabled: boolean | undefined,
    allMilestones: IReleasePlanMilestone[],
): MilestoneStatus => {
    if (milestone.pausedAt) {
        return { type: 'paused' };
    }

    if (milestone.id === activeMilestoneId) {
        return environmentIsDisabled ? { type: 'paused' } : { type: 'active' };
    }

    if (index < activeIndex) {
        return { type: 'completed' };
    }

    const scheduledAt = calculateMilestoneStartTime(
        allMilestones,
        milestone.id,
        activeMilestoneId,
    );

    return {
        type: 'not-started',
        scheduledAt: scheduledAt || undefined,
    };
};
