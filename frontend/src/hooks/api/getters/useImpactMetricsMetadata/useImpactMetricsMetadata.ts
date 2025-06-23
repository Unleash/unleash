import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

export type ImpactMetricsSeries = {
    type: string;
    help: string;
};

export type ImpactMetricsMetadata = {
    series: Record<string, ImpactMetricsSeries>;
};

export const useImpactMetricsMetadata = () => {
    const PATH = `api/admin/impact-metrics/metadata`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsMetadata>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'Impact metrics metadata'),
        );

    return {
        metadata: data,
        refetch,
        loading,
        error,
    };
};
