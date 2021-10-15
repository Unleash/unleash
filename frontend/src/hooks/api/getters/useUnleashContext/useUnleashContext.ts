import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useUnleashContext = (revalidate = true) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/context`);
        return fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Context variables')).then(res => res.json());
    };

    const CONTEXT_CACHE_KEY = 'api/admin/context';

    const { data, error } = useSWR(CONTEXT_CACHE_KEY, fetcher, {
        revalidateOnFocus: revalidate,
        revalidateOnReconnect: revalidate,
        revalidateIfStale: revalidate,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(CONTEXT_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        context: data || [],
        error,
        loading,
        refetch,
        CONTEXT_CACHE_KEY,
    };
};

export default useUnleashContext;
