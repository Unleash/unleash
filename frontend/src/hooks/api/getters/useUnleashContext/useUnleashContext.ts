import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IUnleashContextDefinition } from '../../../../interfaces/context';

interface IUnleashContextOutput {
    context: IUnleashContextDefinition[];
    refetchUnleashContext: () => void;
    loading: boolean;
    error?: Error;
    CONTEXT_CACHE_KEY: string;
}

const useUnleashContext = (
    options: SWRConfiguration = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
    }
): IUnleashContextOutput => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/context`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context variables'))
            .then(res => res.json());
    };

    const CONTEXT_CACHE_KEY = 'api/admin/context';

    const { data, error } = useSWR(CONTEXT_CACHE_KEY, fetcher, options);

    const [loading, setLoading] = useState(!error && !data);

    const refetchUnleashContext = () => {
        mutate(CONTEXT_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        context: data || [],
        error,
        loading,
        refetchUnleashContext,
        CONTEXT_CACHE_KEY,
    };
};

export default useUnleashContext;
