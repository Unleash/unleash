import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

export type TimeSeriesData = [number, number][];

export type ImpactMetricsLabels = Record<string, string[]>;

export type ImpactMetricsSeries = {
    metric: Record<string, string>;
    data: TimeSeriesData;
};

// TODO(impactMetrics): use OpenAPI types
export type ImpactMetricsResponse = {
    start?: string;
    end?: string;
    step?: string;
    series: ImpactMetricsSeries[];
    labels?: ImpactMetricsLabels;
    debug?: {
        query?: string;
        isTruncated?: string;
    };
};

export type ImpactMetricsQuery = {
    series: string;
    range: 'hour' | 'day' | 'week' | 'month';
    labels?: Record<string, string[]>;
    aggregationMode?: 'rps' | 'count' | 'avg' | 'sum' | 'p50' | 'p95' | 'p99';
};

export const useImpactMetricsData = (query?: ImpactMetricsQuery) => {
    const shouldFetch = Boolean(query?.series && query?.range);

    const createPath = () => {
        if (!query) return '';
        const params = new URLSearchParams({
            series: query.series,
            range: query.range,
        });

        if (query.aggregationMode !== undefined) {
            params.append('aggregationMode', query.aggregationMode);
        }

        if (query.labels && Object.keys(query.labels).length > 0) {
            // Send labels as they are - the backend will handle the formatting
            const labelsParam = Object.entries(query.labels).reduce(
                (acc, [key, values]) => {
                    if (values.length > 0) {
                        acc[key] = values;
                    }
                    return acc;
                },
                {} as Record<string, string[]>,
            );

            if (Object.keys(labelsParam).length > 0) {
                params.append('labels', JSON.stringify(labelsParam));
            }
        }

        return `api/admin/impact-metrics/?${params.toString()}`;
    };

    const PATH = createPath();

    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsResponse>(
            shouldFetch ? formatApiPath(PATH) : null,
            shouldFetch
                ? () => fetcher(formatApiPath(PATH), 'Impact metrics data')
                : () => Promise.resolve([]),
            {
                refreshInterval: 30 * 1_000,
                revalidateOnFocus: true,
            },
        );

    return {
        data: data || {
            series: [],
            labels: {},
        },
        refetch,
        loading: shouldFetch ? loading : false,
        error,
    };
};
