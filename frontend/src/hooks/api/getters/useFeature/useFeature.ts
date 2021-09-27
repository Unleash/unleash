import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';

import { formatApiPath } from '../../../../utils/format-path';
import { IFeatureToggle } from '../../../../interfaces/featureToggle';
import { defaultFeature } from './defaultFeature';

interface IUseFeatureOptions {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    revalidateIfStale?: boolean;
}

const useFeature = (
    projectId: string,
    id: string,
    options: IUseFeatureOptions
) => {
    const fetcher = () => {
        const path = formatApiPath(
            `api/admin/projects/${projectId}/features/${id}`
        );
        return fetch(path, {
            method: 'GET',
        }).then(res => res.json());
    };

    const FEATURE_CACHE_KEY = `api/admin/projects/${projectId}/features/${id}`;

    const { data, error } = useSWR<IFeatureToggle>(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(FEATURE_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        feature: data || defaultFeature,
        error,
        loading,
        refetch,
        FEATURE_CACHE_KEY,
    };
};

export default useFeature;
