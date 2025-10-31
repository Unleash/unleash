import { useLocationSettings } from 'hooks/useLocationSettings';
import { getMilestoneProgressionInfo } from './getMilestoneProgressionInfo.ts';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

export const useMilestoneProgressionInfo = (
    intervalMinutes: number,
    sourceMilestoneStartedAt?: string | null,
    status?: MilestoneStatus,
) => {
    const { locationSettings } = useLocationSettings();

    if (status !== 'active') {
        return null;
    }

    return getMilestoneProgressionInfo(
        intervalMinutes,
        sourceMilestoneStartedAt,
        locationSettings.locale,
    );
};
