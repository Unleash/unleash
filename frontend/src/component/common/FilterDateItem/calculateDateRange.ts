import {
    endOfMonth,
    endOfQuarter,
    endOfYear,
    format,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    subMonths,
    subQuarters,
    subYears,
} from 'date-fns';

export type RangeType =
    | 'thisMonth'
    | 'previousMonth'
    | 'thisQuarter'
    | 'previousQuarter'
    | 'thisYear'
    | 'previousYear';

export const calculateDateRange = (
    rangeType: RangeType,
    today = new Date(),
): [string, string] => {
    let start: Date;
    let end: Date;

    switch (rangeType) {
        case 'thisMonth': {
            start = startOfMonth(today);
            end = endOfMonth(today);
            break;
        }
        case 'thisQuarter': {
            start = startOfQuarter(today);
            end = endOfQuarter(today);
            break;
        }
        case 'previousQuarter': {
            const previousQuarter = subQuarters(today, 1);
            start = startOfQuarter(previousQuarter);
            end = endOfQuarter(previousQuarter);
            break;
        }
        case 'thisYear': {
            start = startOfYear(today);
            end = endOfYear(today);
            break;
        }
        case 'previousYear': {
            const lastYear = subYears(today, 1);
            start = startOfYear(lastYear);
            end = endOfYear(lastYear);
            break;
        }

        default: {
            const lastMonth = subMonths(today, 1);
            start = startOfMonth(lastMonth);
            end = endOfMonth(lastMonth);
        }
    }

    return [format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')];
};
