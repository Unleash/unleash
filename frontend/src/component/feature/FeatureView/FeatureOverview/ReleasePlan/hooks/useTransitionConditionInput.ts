import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';

export const DEFAULT_INTERVAL_MINUTES = 300;
export const MAX_TIME_VALUE = 10000;

export type TimeUnit = 'minutes' | 'hours' | 'days';

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

export const useTransitionConditionInput = (
    initialMinutes: number = DEFAULT_INTERVAL_MINUTES,
    onIntervalChange?: (intervalMinutes: number) => void,
) => {
    const initial = getTimeValueAndUnitFromMinutes(initialMinutes);
    const [timeValue, setTimeValue] = useState(initial.value);
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initial.unit);

    const handleTimeValueChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = Math.min(Number(event.target.value), MAX_TIME_VALUE);
        setTimeValue(value);
        onIntervalChange?.(
            getMinutesFromTimeValueAndUnit({ value, unit: timeUnit }),
        );
    };

    const handleTimeUnitChange = (event: SelectChangeEvent<unknown>) => {
        const unit = event.target.value as TimeUnit;
        setTimeUnit(unit);
        onIntervalChange?.(
            getMinutesFromTimeValueAndUnit({ value: timeValue, unit }),
        );
    };

    return {
        timeValue,
        setTimeValue,
        timeUnit,
        setTimeUnit,
        intervalMinutes: getMinutesFromTimeValueAndUnit({
            value: timeValue,
            unit: timeUnit,
        }),
        handleTimeValueChange,
        handleTimeUnitChange,
    };
};
