import { useState } from 'react';

const MAX_INTERVAL_MINUTES = 525600; // 365 days

export type TimeUnit = 'minutes' | 'hours' | 'days';

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
) => {
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initialTimeUnit);
    const [timeValue, setTimeValue] = useState(initialTimeValue);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getIntervalMinutes = () => {
        switch (timeUnit) {
            case 'minutes':
                return timeValue;
            case 'hours':
                return timeValue * 60;
            case 'days':
                return timeValue * 1440;
        }
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        timeUnit,
        setTimeUnit,
        timeValue,
        setTimeValue,
        errors,
        validate,
        getProgressionPayload,
        getIntervalMinutes,
    };
};
