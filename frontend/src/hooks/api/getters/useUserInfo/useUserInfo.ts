import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { createFetcher } from '../useApiGetter/useApiGetter.js';

const useUserInfo = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = createFetcher({
        path: formatApiPath(`api/admin/user-admin/${id}`),
        errorTarget: 'Users',
    });

    const { data, error } = useSWR(
        `api/admin/user-admin/${id}`,
        fetcher,
        options,
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(`api/admin/user-admin/${id}`);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        user: data || {},
        error,
        loading,
        refetch,
    };
};

export default useUserInfo;
