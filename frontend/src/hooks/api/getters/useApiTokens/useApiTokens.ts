import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

const useApiTokens = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/api-tokens`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Api tokens'));
        return res.json();
    };

    const KEY = `api/admin/api-tokens`;

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        tokens: data?.tokens || [],
        error,
        loading,
        refetch,
    };
};

export default useApiTokens;
