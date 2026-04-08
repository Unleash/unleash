import { useMemo } from 'react';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { MetricSource } from 'component/impact-metrics/types';

export type ImpactMetricsSeries = {
    help: string;
    displayName: string;
    source?: MetricSource;
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

export const useImpactMetricsOptions = () => {
    const { metadata, loading, error } = useImpactMetricsMetadata();

    const metricOptions = useMemo(() => {
        if (!metadata?.series) {
            return [];
        }
        return Object.entries(metadata.series).map(([name, rest]) => ({
            name,
            ...rest,
        }));
    }, [metadata]);

    return {
        metricOptions,
        loading,
        error,
    };
};
