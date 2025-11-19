import { useCallback, useState } from 'react';
import { addMinutes, isPast } from 'date-fns';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { formatDateYMDHM } from 'utils/formatDate.ts';

const MAX_INTERVAL_MINUTES = 525600; // 365 days

export type TimeUnit = 'minutes' | 'hours' | 'days';

interface MilestoneProgressionFormDefaults {
    timeValue?: number;
    timeUnit?: TimeUnit;
}

export const getTimeValueAndUnitFromMinutes = (
    minutes: number,
): { value: number; unit: TimeUnit } => {
    if (minutes % 1440 === 0) {
        return { value: minutes / 1440, unit: 'days' };
    }
    if (minutes % 60 === 0) {
        return { value: minutes / 60, unit: 'hours' };
    }
    return { value: minutes, unit: 'minutes' };
};

export const getMinutesFromTimeValueAndUnit = (time: {
    value: number;
    unit: TimeUnit;
}): number => {
    switch (time.unit) {
        case 'minutes':
            return time.value;
        case 'hours':
            return time.value * 60;
        case 'days':
            return time.value * 1440;
    }
};

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
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initialTimeUnit);
    const [timeValue, setTimeValue] = useState(initialTimeValue);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getIntervalMinutes = () => {
        return getMinutesFromTimeValueAndUnit({
            value: timeValue,
            unit: timeUnit,
        });
    };

    const getProgressionPayload = () => {
        return {
            sourceMilestone: sourceMilestoneId,
            targetMilestone: targetMilestoneId,
            transitionCondition: {
                intervalMinutes: getIntervalMinutes(),
            },
        };
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const total = getIntervalMinutes();

        if (timeValue < 0) {
            newErrors.time = 'Time must be non-negative';
        }

        if (total === 0) {
            newErrors.time = 'Time cannot be zero';
        } else if (total > MAX_INTERVAL_MINUTES) {
            newErrors.time = 'Time interval cannot exceed 365 days';
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

    const handleTimeUnitChange = (event: { target: { value: unknown } }) => {
        setTimeUnit(event.target.value as TimeUnit);
    };

    const handleTimeValueChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputValue = event.target.value;
        setTimeValue(Number(inputValue));
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
        getIntervalMinutes,
        handleTimeUnitChange,
        handleTimeValueChange,
    };
};
