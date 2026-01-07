import type { ImpactMetricsConfigListSchema } from 'openapi/index.js';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

/**
 * Get all impact metrics configurations now associated with any feature flag.
 */
export const useImpactMetricsConfig = () => {
    const PATH = `api/admin/impact-metrics/config`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsConfigListSchema>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'impactMetricsConfig'),
        );

    return {
        configs: data?.configs || [],
        refetch,
        loading,
        error,
    };
};
