import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { ImpactMetricsConfigListSchema } from 'openapi';

export const useFeatureImpactMetrics = (feature: string) => {
    const PATH = `api/admin/impact-metrics/config/${feature}`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsConfigListSchema>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'Feature Impact Metrics Config'),
        );

    return {
        settings: data || { configs: [] },
        refetch,
        loading,
        error,
    };
};
