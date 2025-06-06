import { prettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';

export const normalizeDays = (days: number) => {
    if (days <= 0) {
        return 'No data';
    }
    if (days < 1) {
        return '<1 day';
    }
    const rounded = Math.round(days);
    if (rounded === 1) {
        return '1 day';
    }
    return `${prettifyLargeNumber(rounded, 1000, 2)} days`;
};
