import { useLocationSettings } from 'hooks/useLocationSettings';
import { getMilestoneProgressionInfo } from './getMilestoneProgressionInfo.ts';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

export const useMilestoneProgressionInfo = (
    intervalMinutes: number,
    sourceMilestoneStartedAt?: string | null,
    status?: MilestoneStatus,
) => {
    const { locationSettings } = useLocationSettings();
    if (
        !status ||
        status.type !== 'active' ||
        status.progression === 'paused'
    ) {
        return null;
    }

    return getMilestoneProgressionInfo(
        intervalMinutes,
        sourceMilestoneStartedAt,
        locationSettings.locale,
    );
};
