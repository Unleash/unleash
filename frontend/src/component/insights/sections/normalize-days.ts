import { prettifyLargeNumber } from 'component/common/PrettifyLargeNumber/formatLargeNumber.js';

const prettifyNumber = prettifyLargeNumber(1000, 2);

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
    return `${prettifyNumber(rounded)} days`;
};
