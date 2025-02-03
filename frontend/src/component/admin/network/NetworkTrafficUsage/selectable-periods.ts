import { getDaysInMonth, subMonths } from 'date-fns';
import { currentDate, formatMonth } from './dates';

export type Period = {
    key: string;
    dayCount: number;
    label: string;
    year: number;
    month: number;
    selectable: boolean;
    shortLabel: string;
};

export const toSelectablePeriod = (
    date: Date,
    label?: string,
    selectable = true,
): Period => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const period = formatMonth(date);
    const dayCount = getDaysInMonth(date);
    return {
        key: period,
        year,
        month,
        dayCount,
        shortLabel: date.toLocaleString('en-US', {
            month: 'short',
        }),
        label:
            label ||
            date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        selectable,
    };
};

// todo: test
const generateSelectablePeriodsFromDate = (now: Date) => {
    const selectablePeriods = [toSelectablePeriod(now, 'Current month')];
    for (
        let subtractMonthCount = 1;
        subtractMonthCount < 12;
        subtractMonthCount++
    ) {
        const date = subMonths(now, subtractMonthCount);
        selectablePeriods.push(
            toSelectablePeriod(date, undefined, date >= new Date('2024-05')),
        );
    }
    return selectablePeriods;
};
export const selectablePeriods = generateSelectablePeriodsFromDate(currentDate);
export const periodsRecord = Object.fromEntries(
    selectablePeriods.map((period) => [period.key, period]),
);
