import { useCallback, useState } from 'react';
import { addMinutes, isPast } from 'date-fns';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { formatDateYMDHM } from 'utils/formatDate.ts';
import {
    getMinutesFromTimeValueAndUnit,
    MAX_TIME_VALUE,
    type TimeUnit,
    useTransitionConditionInput,
} from './useTransitionConditionInput.ts';

interface MilestoneProgressionFormDefaults {
    timeValue?: number;
    timeUnit?: TimeUnit;
}

export const useMilestoneProgressionForm = (
    sourceMilestoneId: string,
    targetMilestoneId: string,
    {
        timeUnit: initialTimeUnit = 'hours',
        timeValue: initialTimeValue = 5,
    }: MilestoneProgressionFormDefaults = {},
    sourceMilestoneStartedAt?: string | null,
    status?: MilestoneStatus,
) => {
    const {
        timeValue,
        setTimeValue,
        timeUnit,
        setTimeUnit,
        intervalMinutes,
        handleTimeValueChange,
        handleTimeUnitChange,
    } = useTransitionConditionInput(
        getMinutesFromTimeValueAndUnit({
            value: initialTimeValue,
            unit: initialTimeUnit,
        }),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getProgressionPayload = () => {
        return {
            sourceMilestone: sourceMilestoneId,
            targetMilestone: targetMilestoneId,
            transitionCondition: {
                intervalMinutes: intervalMinutes,
            },
        };
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const total = intervalMinutes;

        if (timeValue < 0) {
            newErrors.time = 'Time must be non-negative';
        }

        if (total === 0) {
            newErrors.time = 'Time cannot be zero';
        } else if (timeValue > MAX_TIME_VALUE) {
            newErrors.time = `Value cannot exceed ${MAX_TIME_VALUE}`;
        }

        // Only validate against current time for active/paused milestones
        // Completed and not-started milestones shouldn't validate against current time
        if (
            sourceMilestoneStartedAt &&
            total > 0 &&
            status &&
            (status.type === 'active' || status.type === 'paused')
        ) {
            const startDate = new Date(sourceMilestoneStartedAt);
            const nextMilestoneDate = addMinutes(startDate, total);

            if (isPast(nextMilestoneDate)) {
                const formattedDate = formatDateYMDHM(nextMilestoneDate);
                newErrors.time = `Next milestone can't start in the past (${formattedDate})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        timeUnit,
        setTimeUnit,
        timeValue,
        setTimeValue,
        errors,
        clearErrors,
        validate,
        getProgressionPayload,
        intervalMinutes,
        handleTimeUnitChange,
        handleTimeValueChange,
    };
};
