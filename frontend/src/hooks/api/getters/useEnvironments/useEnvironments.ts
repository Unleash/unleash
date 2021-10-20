import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { IEnvironmentResponse } from '../../../../interfaces/environments';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

export const ENVIRONMENT_CACHE_KEY = `api/admin/environments`;

const useEnvironments = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/environments`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Environments'))
            .then(res => res.json());
    };

    const { data, error } = useSWR<IEnvironmentResponse>(
        ENVIRONMENT_CACHE_KEY,
        fetcher,
        options
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(ENVIRONMENT_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        environments: data?.environments || [],
        error,
        loading,
        refetch,
    };
};

export default useEnvironments;
