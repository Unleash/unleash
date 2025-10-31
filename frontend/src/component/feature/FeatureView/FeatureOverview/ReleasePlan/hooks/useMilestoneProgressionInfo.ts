import { formatDistanceToNow, addMinutes } from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHM } from 'utils/formatDate.ts';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

export const useMilestoneProgressionInfo = (
    intervalMinutes: number,
    sourceMilestoneStartedAt?: string | null,
    status?: MilestoneStatus,
) => {
    const { locationSettings } = useLocationSettings();

    if (!sourceMilestoneStartedAt || !(status === 'active' || status === 'paused')) {
        return null;
    }

    const startDate = new Date(sourceMilestoneStartedAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - startDate.getTime()) / 60000);
    const proceedDate = addMinutes(startDate, intervalMinutes);

    if (elapsedMinutes >= intervalMinutes) {
        const elapsedTime = formatDistanceToNow(startDate, { addSuffix: false });
        return `Already ${elapsedTime} in this milestone.`;
    }

    const proceedTime = formatDateYMDHM(proceedDate, locationSettings.locale);
    const remainingTime = formatDistanceToNow(proceedDate, { addSuffix: false });
    return `Will proceed at ${proceedTime} (in ${remainingTime}).`;
};

