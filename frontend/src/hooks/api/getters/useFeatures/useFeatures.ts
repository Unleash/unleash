import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useFeatures = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath('api/admin/features/');
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Features'))
            .then(res => res.json());
    };

    const FEATURES_CACHE_KEY = 'api/admin/features/';

    const { data, error } = useSWR(FEATURES_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchFeatures = () => {
        mutate(FEATURES_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        features: data?.features || [],
        error,
        loading,
        refetchFeatures,
    };
};

export default useFeatures;
