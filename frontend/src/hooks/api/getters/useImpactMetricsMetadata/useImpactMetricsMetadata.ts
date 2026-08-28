import type { SWRConfiguration } from 'swr';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type {
    AvailableImpactMetricsSchema,
    AvailableImpactMetricsSchemaMetricsItem,
} from 'openapi';

export type ImpactMetric = AvailableImpactMetricsSchemaMetricsItem;
export type ImpactMetricsMetadata = AvailableImpactMetricsSchema;

export const useImpactMetricsMetadata = (options?: SWRConfiguration) => {
    const PATH = `api/admin/impact-metrics/metadata`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsMetadata>(
            formatApiPath(PATH),
            () => fetcher(formatApiPath(PATH), 'Impact metrics metadata'),
            options,
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
