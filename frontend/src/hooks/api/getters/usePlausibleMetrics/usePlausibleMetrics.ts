import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { PlausibleMetricsResponseSchema } from 'openapi/models/plausibleMetricsResponseSchema.js';

export const usePlausibleMetrics = () => {
    const PATH = 'api/admin/impact-metrics/plausible';
    const { data, refetch, loading, error } =
        useApiGetter<PlausibleMetricsResponseSchema>(
            formatApiPath(PATH),
            () => fetcher(formatApiPath(PATH), 'Plausible metrics'),
            {
                refreshInterval: 30 * 1_000,
                revalidateOnFocus: true,
            },
        );

    return {
        data: data || { data: [] },
        refetch,
        loading,
        error,
    };
};
