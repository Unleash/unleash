import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { MetricSource } from 'component/impact-metrics/types';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type {
    ImpactMetricsDataSchema,
    ImpactMetricsDataSchemaLabels,
    ImpactMetricsDataSchemaSeriesItem,
} from 'openapi';

// Narrow the generated `(number | string)[][]` tuple to the actual contract
// `[number, string][]`. OpenAPI 3.0 can't express ordered tuples, so orval
// generates the loose form; the backend always returns [timestamp, value].
export type ImpactMetricsLabels = ImpactMetricsDataSchemaLabels;
export type ImpactMetricsSeries = Omit<
    ImpactMetricsDataSchemaSeriesItem,
    'data'
> & {
    data: [number, string][];
};
export type ImpactMetricsResponse = Omit<ImpactMetricsDataSchema, 'series'> & {
    series: ImpactMetricsSeries[];
};

export type ImpactMetricsQuery = {
    metricName: string;
    range: 'hour' | 'day' | 'week' | 'month';
    aggregationMode?: 'rps' | 'count' | 'avg' | 'sum' | 'p50' | 'p95' | 'p99';
    source?: MetricSource;
    labels?: Record<string, string[]>;
    mode?: 'display' | 'edit';
};

const DEFAULT_AGGREGATION_MODE = 'count';
const DEFAULT_SOURCE: MetricSource = 'internal';

// Wider ranges are costlier to query and tolerate staler data (trend views),
// so we poll them less often — a deliberate staleness budget, max 10 minutes.
export const rangeToRefreshInterval = (range: ChartTimeRange): number => {
    switch (range) {
        case 'hour':
            return 30_000;
        case 'day':
            return 2 * 60_000;
        case 'week':
            return 5 * 60_000;
        case 'month':
        case 'threeMonths':
        case 'sixMonths':
            return 10 * 60_000;
    }
};

export const useImpactMetricsData = (
    query?: ImpactMetricsQuery,
    options?: { refreshInterval?: number },
) => {
    const shouldFetch = Boolean(query?.metricName && query?.range);

    const createPath = () => {
        if (!query) return '';
        const params = new URLSearchParams({
            metricName: query.metricName,
            range: query.range,
            aggregationMode: query.aggregationMode ?? DEFAULT_AGGREGATION_MODE,
            source: query.source ?? DEFAULT_SOURCE,
        });

        if (query.mode) {
            params.append('mode', query.mode);
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
                refreshInterval:
                    options?.refreshInterval ??
                    (query ? rangeToRefreshInterval(query.range) : 0),
                revalidateOnFocus: true,
            },
        );

    return {
        data:
            data ||
            ({
                series: [],
                labels: {},
                start: '',
                end: '',
                step: '',
            } as ImpactMetricsResponse),
        refetch,
        loading: shouldFetch ? loading : false,
        error,
    };
};
