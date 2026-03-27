import { prettifyLargeNumber } from '../common/PrettifyLargeNumber/formatLargeNumber.js';

export const getTimeUnit = (timeRange: string) => {
    switch (timeRange) {
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

export const getDisplayFormat = (timeRange: string) => {
    switch (timeRange) {
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
        return 'Value';
    }

    if (!__name__) {
        return labelParts;
    }

    if (!labelParts) {
        return __name__;
    }

    return `${__name__} (${labelParts})`;
};

export const formatLargeNumbers = prettifyLargeNumber(1000, 1);

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'unknown';

const KNOWN_METRIC_TYPES: MetricType[] = ['counter', 'gauge', 'histogram'];

export const getMetricType = (
    seriesName: string,
    typeLabel?: string[],
): MetricType => {
    if (seriesName.startsWith('unleash_counter_')) return 'counter';
    if (seriesName.startsWith('unleash_gauge_')) return 'gauge';
    if (seriesName.startsWith('unleash_histogram_')) return 'histogram';
    if (
        typeLabel?.length === 1 &&
        KNOWN_METRIC_TYPES.includes(typeLabel[0] as MetricType)
    ) {
        return typeLabel[0] as MetricType;
    }
    return 'unknown';
};

export const getMetricDisplayName = (metricName: string): string => {
    if (metricName.startsWith('unleash_counter_'))
        return metricName.slice('unleash_counter_'.length);
    if (metricName.startsWith('unleash_gauge_'))
        return metricName.slice('unleash_gauge_'.length);
    if (metricName.startsWith('unleash_histogram_'))
        return metricName.slice('unleash_histogram_'.length);
    return metricName;
};

export const getDefaultAggregation = (metricType: MetricType) => {
    if (metricType === 'counter') return 'count';
    if (metricType === 'histogram') return 'p50';
    return 'avg';
};
