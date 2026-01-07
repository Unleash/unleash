import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { ImpactMetricsConfigListSchema } from 'openapi';

export const useFeatureImpactMetrics = ({
    projectId,
    featureName,
}: {
    projectId: string;
    featureName: string;
}) => {
    const PATH = `api/admin/projects/${projectId}/features/${featureName}/impact-metrics/config`;
    const { data, refetch, loading, error } =
        useApiGetter<ImpactMetricsConfigListSchema>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'Feature Impact Metrics'),
        );

    return {
        impactMetrics: data || { configs: [] },
        refetch,
        loading,
        error,
    };
};
