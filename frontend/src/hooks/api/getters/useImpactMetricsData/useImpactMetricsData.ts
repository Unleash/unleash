import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

export type TimeSeriesData = [number, number][];

export type ImpactMetricsQuery = {
    series: string;
    range: 'hour' | 'day' | 'week' | 'month';
};

export const useImpactMetricsData = (query?: ImpactMetricsQuery) => {
    const shouldFetch = Boolean(query?.series && query?.range);

    const createPath = () => {
        if (!query) return '';
        const params = new URLSearchParams({
            series: query.series,
            range: query.range,
        });
        return `api/admin/impact-metrics/?${params.toString()}`;
    };

    const PATH = createPath();

    const { data, refetch, loading, error } = useApiGetter<{
        start?: string;
        end?: string;
        step?: string;
        data: TimeSeriesData;
    }>(
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
            data: [],
        },
        refetch,
        loading: shouldFetch ? loading : false,
        error,
    };
};
