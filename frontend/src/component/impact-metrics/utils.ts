export const getTimeUnit = (selectedRange: string) => {
    switch (selectedRange) {
        case 'hour':
            return 'minute';
        case 'day':
            return 'hour';
        case 'week':
            return 'day';
        case 'month':
            return 'week';
        default:
            return 'day';
    }
};

export const getDisplayFormat = (selectedRange: string) => {
    switch (selectedRange) {
        case 'hour':
            return 'HH:mm';
        case 'day':
            return 'HH:mm';
        case 'week':
            return 'MMM dd';
        case 'month':
            return 'MMM dd';
        default:
            return 'MMM dd';
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

export const formatLargeNumbers = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
};

export const getMetricType = (seriesName: string) => {
    if (seriesName.startsWith('unleash_counter_')) return 'counter';
    if (seriesName.startsWith('unleash_gauge')) return 'gauge';
    return 'unknown';
};
