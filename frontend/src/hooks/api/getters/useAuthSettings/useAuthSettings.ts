import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useAuthSettings = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/auth/${id}/settings`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Auth settings'));
        return res.json();
    };

    const KEY = `api/admin/auth/${id}/settings`;

    const { data, error } = useSWR(KEY, fetcher, options);
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
