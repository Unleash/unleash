import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';

import { formatApiPath } from '../../../../utils/format-path';
import { IEnvironment } from '../../../../interfaces/environments';
import handleErrorResponses from '../httpErrorResponseHandler';
import { defaultEnvironment } from './defaultEnvironment';

const useEnvironment = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/environments/${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Environment data'))
            .then(res => res.json());
    };

    const FEATURE_CACHE_KEY = `api/admin/environments/${id}`;

    const { data, error } = useSWR<IEnvironment>(FEATURE_CACHE_KEY, fetcher, {
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
        environment: data || defaultEnvironment,
        error,
        loading,
        refetch,
        FEATURE_CACHE_KEY,
    };
};

export default useEnvironment;
