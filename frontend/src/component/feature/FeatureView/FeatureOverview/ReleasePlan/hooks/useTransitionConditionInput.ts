import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import type { TransitionConditionSchema } from 'openapi';

export const DEFAULT_INTERVAL_MINUTES = 300;
export const MAX_TIME_VALUE = 10000;

export type TimeUnit = 'minutes' | 'hours' | 'days';
export type TransitionUnit = TimeUnit | 'exposures';

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

export const getValueAndUnitFromCondition = (
    condition: TransitionConditionSchema,
): { value: number; unit: TransitionUnit } => {
    if (condition.type === 'exposure') {
        return { value: condition.minimumExposures, unit: 'exposures' };
    }
    return getTimeValueAndUnitFromMinutes(condition.intervalMinutes);
};

export const getConditionFromValueAndUnit = (
    value: number,
    unit: TransitionUnit,
): TransitionConditionSchema =>
    unit === 'exposures'
        ? { type: 'exposure', minimumExposures: value }
        : { intervalMinutes: getMinutesFromTimeValueAndUnit({ value, unit }) };

export const useTransitionConditionInput = (
    initialCondition: TransitionConditionSchema = {
        intervalMinutes: DEFAULT_INTERVAL_MINUTES,
    },
    onConditionChange?: (condition: TransitionConditionSchema) => void,
) => {
    const initial = getValueAndUnitFromCondition(initialCondition);
    const [value, setValue] = useState(initial.value);
    const [unit, setUnit] = useState<TransitionUnit>(initial.unit);

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = Math.round(Number(event.target.value));
        const newValue =
            unit === 'exposures'
                ? inputValue
                : Math.min(inputValue, MAX_TIME_VALUE);
        setValue(newValue);
        onConditionChange?.(getConditionFromValueAndUnit(newValue, unit));
    };

    const handleUnitChange = (event: SelectChangeEvent<unknown>) => {
        const newUnit = event.target.value as TransitionUnit;
        setUnit(newUnit);
        onConditionChange?.(getConditionFromValueAndUnit(value, newUnit));
    };

    return {
        value,
        setValue,
        unit,
        setUnit,
        condition: getConditionFromValueAndUnit(value, unit),
        handleValueChange,
        handleUnitChange,
    };
};
