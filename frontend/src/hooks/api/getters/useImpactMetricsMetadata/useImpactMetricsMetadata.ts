import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

export type ImpactMetricsMetadata = {
    series: string[];
    labels: string[];
};

export const useImpactMetricsMetadata = () => {
    const PATH = `api/admin/impact-metrics/metadata`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsMetadata>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'Impact metrics metadata'),
        );

    return {
        metadata: data || { series: [], labels: [] },
        refetch,
        loading,
        error,
    };
};
