import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { defaultValue } from './defaultValue';

const REQUEST_KEY = 'api/admin/ui-config';

const useUiConfig = () => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/ui-config`);

        return fetch(path, {
            method: 'GET',
            credentials: 'include',
        }).then(res => res.json());
    };

    const { data, error } = useSWR(REQUEST_KEY, fetcher);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(REQUEST_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        uiConfig: data || defaultValue,
        error,
        loading,
        refetch,
    };
};

export default useUiConfig;
