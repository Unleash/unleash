import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type {
    MilestoneStatus,
    MilestoneProgressionStatus,
} from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { calculateMilestoneStartTime } from '../utils/calculateMilestoneStartTime.js';

export const calculateMilestoneStatus = (
    milestone: IReleasePlanMilestone,
    activeMilestoneId: string | undefined,
    index: number,
    activeIndex: number,
    environmentIsDisabled: boolean | undefined,
    allMilestones: IReleasePlanMilestone[],
): MilestoneStatus => {
    const progression: MilestoneProgressionStatus = milestone.pausedAt
        ? 'paused'
        : 'active';

    if (milestone.id === activeMilestoneId) {
        return environmentIsDisabled
            ? { type: 'paused', progression }
            : { type: 'active', progression };
    }

    if (index < activeIndex) {
        return { type: 'completed', progression };
    }

    const scheduledAt = environmentIsDisabled
        ? null
        : calculateMilestoneStartTime(
              allMilestones,
              milestone.id,
              activeMilestoneId,
          );

    return {
        type: 'not-started',
        scheduledAt: scheduledAt || undefined,
        progression,
    };
};
