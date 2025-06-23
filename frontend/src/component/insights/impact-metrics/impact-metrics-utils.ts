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

export const getSeriesLabel = (metric: Record<string, string>): string => {
    const { __name__, ...labels } = metric;

    const labelParts = Object.entries(labels)
        .filter(([key, value]) => key !== '__name__' && value)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');

    if (!__name__ && !labelParts) {
        return 'Series';
    }

    if (!__name__) {
        return labelParts;
    }

    if (!labelParts) {
        return __name__;
    }

    return `${__name__} (${labelParts})`;
};
