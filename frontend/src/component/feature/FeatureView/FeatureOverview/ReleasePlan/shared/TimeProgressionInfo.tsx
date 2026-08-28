import { useLocationSettings } from 'hooks/useLocationSettings';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { getMilestoneProgressionInfo } from '../utils/getMilestoneProgressionInfo.ts';
import { StyledInfoLine } from './SharedFormComponents.tsx';

interface TimeProgressionInfoProps {
    intervalMinutes: number;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
}

export const TimeProgressionInfo = ({
    intervalMinutes,
    sourceMilestoneStartedAt,
    status,
}: TimeProgressionInfoProps) => {
    const { locationSettings } = useLocationSettings();

    if (status?.type !== 'active' || status.progression === 'paused') {
        return null;
    }

    const info = getMilestoneProgressionInfo(
        intervalMinutes,
        sourceMilestoneStartedAt,
        locationSettings.locale,
    );

    if (!info) {
        return null;
    }

    return <StyledInfoLine>{info}</StyledInfoLine>;
};
