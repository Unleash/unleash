import { useState } from 'react';

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

export const getIntervalMinutesFromValueAndUnit = (
    value: number,
    unit: TimeUnit,
): number => {
    switch (unit) {
        case 'minutes':
            return value;
        case 'hours':
            return value * 60;
        case 'days':
            return value * 1440;
    }
};

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
        return getIntervalMinutesFromValueAndUnit(timeValue, timeUnit);
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

    const handleTimeUnitChange = (event: { target: { value: unknown } }) => {
        setTimeUnit(event.target.value as TimeUnit);
    };

    const handleTimeValueChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputValue = event.target.value;
        if (inputValue === '' || /^\d+$/.test(inputValue)) {
            const value = inputValue === '' ? 0 : Number.parseInt(inputValue);
            setTimeValue(value);
        }
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
        handleTimeUnitChange,
        handleTimeValueChange,
    };
};
