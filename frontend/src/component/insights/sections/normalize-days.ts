import millify from 'millify';

const prettifyLargeNumber = (value: number, precision = 2): string => {
    if (value < 1000) {
        return value.toLocaleString();
    }
    return millify(value, { precision });
};

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
    return `${prettifyLargeNumber(rounded)} days`;
};
