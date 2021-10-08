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
    options: IUseFeatureOptions = {}
) => {
    const fetcher = async () => {
        const path = formatApiPath(
            `api/admin/projects/${projectId}/features/${id}`
        );

        const res = await fetch(path, {
            method: 'GET',
        });


        // If the status code is not in the range 200-299,
        // we still try to parse and throw it.
        if (!res.ok) {
          const error = new Error('An error occurred while fetching the data.')
          // Attach extra info to the error object.
          // @ts-ignore
          error.info = await res.json();
          // @ts-ignore
          error.status = res.status;
          throw error;
        }
      
        return res.json()
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
