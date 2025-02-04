import { getDaysInMonth } from 'date-fns';
import { formatMonth } from './dates';
import { TRAFFIC_MEASUREMENT_START_DATE } from 'utils/traffic-calculations';

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

export const generateSelectablePeriodsFromDate = (now: Date) => {
    const selectablePeriods = [toSelectablePeriod(now, 'Current month')];
    for (
        let subtractMonthCount = 1;
        subtractMonthCount < 12;
        subtractMonthCount++
    ) {
        // this complicated calc avoids DST issues
        const utcYear = now.getUTCFullYear();
        const utcMonth = now.getUTCMonth();
        const targetMonth = utcMonth - subtractMonthCount;
        const targetDate = new Date(Date.UTC(utcYear, targetMonth, 1, 0, 0, 0));
        selectablePeriods.push(
            toSelectablePeriod(
                targetDate,
                undefined,
                targetDate >= TRAFFIC_MEASUREMENT_START_DATE,
            ),
        );
    }
    return selectablePeriods;
};
export const selectablePeriods = [];
export const periodsRecord = Object.fromEntries(
    selectablePeriods.map((period) => [period.key, period]),
);
