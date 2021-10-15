import { formatApiPath } from '../../../../utils/format-path';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { IFeatureMetrics } from '../../../../interfaces/featureToggle';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseFeatureMetricsOptions {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    revalidateIfStale?: boolean;
    revalidateOnMount?: boolean;
}

const emptyMetrics = { lastHourUsage: [], seenApplications: [] };

const useFeatureMetrics = (projectId: string, featureId: string, options: IUseFeatureMetricsOptions = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/client-metrics/features/${featureId}`);
        const res = await fetch(path, {
            method: 'GET'
        }).then(handleErrorResponses('feature metrics'));
        if (res.ok) {
            return res.json();
        } else {
            return emptyMetrics;
        }
    };

    const FEATURE_METRICS_CACHE_KEY = `${projectId}_${featureId}_metrics`;
    const { data, error } = useSWR<IFeatureMetrics>(
        FEATURE_METRICS_CACHE_KEY,
        fetcher,
        {
            ...options
        }
    );

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(FEATURE_METRICS_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        metrics: data || emptyMetrics,
        error,
        loading,
        refetch,
        FEATURE_METRICS_CACHE_KEY
    };
};

export default useFeatureMetrics;
