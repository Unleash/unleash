import type { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { fetcher } from '../useApiGetter/useApiGetter.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { formatApiPath } from 'utils/formatPath';
import type {
    AvailableImpactMetricsSchema,
    AvailableImpactMetricsSchemaMetricsItem,
} from 'openapi';

export type ImpactMetric = AvailableImpactMetricsSchemaMetricsItem;
export type ImpactMetricsMetadata = AvailableImpactMetricsSchema;

const fallbackMetadata: ImpactMetricsMetadata = { metrics: [] };

export const useImpactMetricsMetadata = (
    options?: SWRConfiguration & { enabled?: boolean },
) => {
    const enabled = options?.enabled ?? true;
    const PATH = formatApiPath('api/admin/impact-metrics/metadata');
    const { data, error, mutate } = useConditionalSWR<ImpactMetricsMetadata>(
        enabled,
        fallbackMetadata,
        PATH,
        () => fetcher(PATH, 'Impact metrics metadata'),
        options,
    );

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    return {
        metadata: data,
        refetch,
        loading: !error && !data,
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
