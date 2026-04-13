import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { MetricSource } from 'component/impact-metrics/types';

export type ImpactMetric = {
    name: string;
    help: string;
    displayName: string;
    source: MetricSource;
};

export type ImpactMetricsMetadata = {
    metrics: ImpactMetric[];
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

export const useImpactMetricsOptions = () => {
    const { metadata, loading, error } = useImpactMetricsMetadata();

    return {
        metricOptions: metadata?.metrics ?? [],
        loading,
        error,
    };
};
