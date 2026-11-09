import { addMinutes, isPast } from 'date-fns';
import { formatDateYMDHM } from 'utils/formatDate.ts';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import {
    getMinutesFromTimeValueAndUnit,
    MAX_TIME_VALUE,
    type TransitionUnit,
} from '../hooks/useTransitionConditionInput.ts';

export const getTransitionConditionError = ({
    value,
    unit,
    sourceMilestoneStartedAt,
    status,
}: {
    value: number;
    unit: TransitionUnit;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
}): string | undefined => {
    if (value < 0) {
        return 'Value must be non-negative';
    }

    if (!Number.isInteger(value)) {
        return 'Value must be a whole number';
    }

    if (value === 0) {
        return unit === 'exposures'
            ? 'Exposures cannot be zero'
            : 'Time cannot be zero';
    }

    if (unit !== 'exposures' && value > MAX_TIME_VALUE) {
        return `Value cannot exceed ${MAX_TIME_VALUE}`;
    }

    const milestoneIsRunning =
        status?.type === 'active' || status?.type === 'paused';

    if (
        unit !== 'exposures' &&
        sourceMilestoneStartedAt &&
        milestoneIsRunning
    ) {
        const nextMilestoneDate = addMinutes(
            new Date(sourceMilestoneStartedAt),
            getMinutesFromTimeValueAndUnit({ value, unit }),
        );

        if (isPast(nextMilestoneDate)) {
            return `Next milestone can't start in the past (${formatDateYMDHM(nextMilestoneDate)})`;
        }
    }

    return undefined;
};
