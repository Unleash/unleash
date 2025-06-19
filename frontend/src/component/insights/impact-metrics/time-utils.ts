export const getTimeUnit = (selectedRange: string) => {
    switch (selectedRange) {
        case 'hour':
            return 'minute';
        case 'day':
            return 'hour';
        case 'week':
            return 'day';
        case 'month':
            return 'day';
        default:
            return 'hour';
    }
};

export const getDisplayFormat = (selectedRange: string) => {
    switch (selectedRange) {
        case 'hour':
        case 'day':
            return 'HH:mm';
        case 'week':
        case 'month':
            return 'MMM dd';
        default:
            return 'MMM dd HH:mm';
    }
};
