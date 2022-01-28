import handleErrorResponses from '../httpErrorResponseHandler';
import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';

const useUiBootstrap = (options: SWRConfiguration = {}) => {
    const BOOTSTRAP_CACHE_KEY = `api/admin/ui-bootstrap`;

    const fetcher = () => {
        const path = formatApiPath(`api/admin/ui-bootstrap`);

        return fetch(path, {
            method: 'GET',
            credentials: 'include',
        })
            .then(handleErrorResponses('ui bootstrap'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(BOOTSTRAP_CACHE_KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchUiBootstrap = () => {
        mutate(BOOTSTRAP_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        bootstrap: data,
        error,
        loading,
        refetchUiBootstrap,
    };
};

export default useUiBootstrap;
