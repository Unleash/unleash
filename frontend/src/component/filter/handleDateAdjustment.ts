import { isAfter, isBefore } from 'date-fns';

type DateFilterValue = { values: string[] };

const isDateFilter = (value: unknown): value is DateFilterValue =>
    typeof value === 'object' &&
    value !== null &&
    'values' in value &&
    Array.isArray((value as DateFilterValue).values);

type HandleDateAdjustmentOptions = {
    fromKey: string;
    toKey: string;
};

export const handleDateAdjustment = <T extends Record<string, unknown>>(
    oldState: Record<string, unknown>,
    stateUpdate: T,
    { fromKey, toKey }: HandleDateAdjustmentOptions = {
        fromKey: 'from',
        toKey: 'to',
    },
): T => {
    const { [fromKey]: from, [toKey]: to } = stateUpdate;
    if (isDateFilter(from) && !to) {
        const oldTo = oldState[toKey];
        if (
            isDateFilter(oldTo) &&
            isAfter(new Date(from.values[0]), new Date(oldTo.values[0]))
        ) {
            return {
                ...stateUpdate,
                [toKey]: from,
            };
        }
    } else if (isDateFilter(to) && !from) {
        const oldFrom = oldState[fromKey];
        if (
            isDateFilter(oldFrom) &&
            isBefore(new Date(to.values[0]), new Date(oldFrom.values[0]))
        ) {
            return {
                ...stateUpdate,
                [fromKey]: to,
            };
        }
    }

    return stateUpdate;
};
