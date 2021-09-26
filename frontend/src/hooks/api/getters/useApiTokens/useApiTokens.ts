import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';

const useApiTokens = () => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/api-tokens`);
        const res = await fetch(path, {
            method: 'GET',
        });
        return res.json();
    };

    const KEY = `api/admin/api-tokens`;

    const { data, error } = useSWR(KEY, fetcher);
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
