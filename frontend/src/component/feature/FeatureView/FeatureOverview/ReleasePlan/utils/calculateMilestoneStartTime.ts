import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import { addMinutes } from 'date-fns';

const parseStartTime = (startedAt: string | null | undefined): Date | null => {
    if (!startedAt) return null;

    const date = new Date(startedAt);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date;
};

const getIntervalMinutes = (
    milestone: IReleasePlanMilestone,
): number | null => {
    const intervalMinutes = milestone.transitionCondition?.intervalMinutes;

    if (!intervalMinutes) {
        return null;
    }
    return intervalMinutes;
};

const findMostRecentStartedMilestone = (
    milestones: IReleasePlanMilestone[],
    targetIndex: number,
): { index: number; startTime: Date } | null => {
    for (let i = targetIndex; i >= 0; i--) {
        const startTime = parseStartTime(milestones[i].startedAt);
        if (startTime) {
            return { index: i, startTime };
        }
    }
    return null;
};

const findBaselineMilestone = (
    milestones: IReleasePlanMilestone[],
    targetIndex: number,
    activeMilestoneId?: string,
): { index: number; startTime: Date } | null => {
    if (!activeMilestoneId) {
        return findMostRecentStartedMilestone(milestones, targetIndex);
    }

    const activeIndex = milestones.findIndex((m) => m.id === activeMilestoneId);
    if (activeIndex === -1 || activeIndex > targetIndex) {
        return findMostRecentStartedMilestone(milestones, targetIndex);
    }

    const activeStartTime = parseStartTime(milestones[activeIndex].startedAt);
    if (activeStartTime) {
        return { index: activeIndex, startTime: activeStartTime };
    }

    return findMostRecentStartedMilestone(milestones, targetIndex);
};

const calculateTimeFromBaseline = (
    milestones: IReleasePlanMilestone[],
    baseline: { index: number; startTime: Date },
    targetIndex: number,
): Date | null => {
    let currentTime = baseline.startTime;

    for (let i = baseline.index; i < targetIndex; i++) {
        const previousMilestone = milestones[i];
        const intervalMinutes = getIntervalMinutes(previousMilestone);

        if (!intervalMinutes) return null;

        currentTime = addMinutes(currentTime, intervalMinutes);
    }

    return currentTime;
};

export const calculateMilestoneStartTime = (
    milestones: IReleasePlanMilestone[],
    targetMilestoneId: string,
    activeMilestoneId?: string,
): Date | null => {
    const targetIndex = milestones.findIndex((m) => m.id === targetMilestoneId);
    if (targetIndex === -1) return null;

    const baseline = findBaselineMilestone(
        milestones,
        targetIndex,
        activeMilestoneId,
    );
    if (!baseline) return null;

    if (baseline.index === targetIndex) {
        return baseline.startTime;
    }

    return calculateTimeFromBaseline(milestones, baseline, targetIndex);
};
