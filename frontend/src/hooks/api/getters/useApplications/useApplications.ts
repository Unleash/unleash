import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useApplications = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath('api/admin/metrics/applications');
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context data'))
            .then(res => res.json());
    };

    const FEATURE_CACHE_KEY = 'api/admin/metrics/applications';

    const { data, error } = useSWR(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetchApplications = () => {
        mutate(FEATURE_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        applications: data?.applications || {},
        error,
        loading,
        refetchApplications,
        FEATURE_CACHE_KEY,
    };
};

export default useApplications;
