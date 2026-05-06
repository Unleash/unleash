import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

const PATH = `api/admin/impact-metrics/external-source`;

export type ExternalImpactMetricsSource = {
    enabled: boolean;
    url?: string;
};

const DEFAULT_DATA: ExternalImpactMetricsSource = {
    enabled: false,
};

export const useExternalImpactMetricsSource = () => {
    const { data, refetch, loading, error } =
        useApiGetter<ExternalImpactMetricsSource>(formatApiPath(PATH), () =>
            fetcher(formatApiPath(PATH), 'External impact metrics source'),
        );

    return {
        source: data ?? DEFAULT_DATA,
        refetch,
        loading,
        error,
    };
};
