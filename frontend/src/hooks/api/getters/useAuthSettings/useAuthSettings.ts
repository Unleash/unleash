import { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';

const useAuthSettings = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/auth/${id}/settings`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Auth settings'));
        return res.json();
    };

    const KEY = `api/admin/auth/${id}/settings`;

    const { data, error } = useEnterpriseSWR({}, KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        config: data || {},
        error,
        loading,
        refetch,
    };
};

export default useAuthSettings;
