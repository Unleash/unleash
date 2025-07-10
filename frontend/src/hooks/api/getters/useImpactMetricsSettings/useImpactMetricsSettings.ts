import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { ImpactMetricsState } from 'component/impact-metrics/types.ts';

export const useImpactMetricsSettings = () => {
    const PATH = `api/admin/impact-metrics/settings`;
    const { data, refetch, loading, error } = useApiGetter<ImpactMetricsState>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Impact metrics settings'),
    );

    return {
        settings: data || { charts: [], layout: [] },
        refetch,
        loading,
        error,
    };
};
