import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IPermission } from '../../../../interfaces/user';
import handleErrorResponses from '../httpErrorResponseHandler';

export const USER_CACHE_KEY = `api/admin/user`;

const useUser = () => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('User info'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(USER_CACHE_KEY, fetcher);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(USER_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        user: data?.user || {},
        permissions: (data?.permissions || []) as IPermission[],
        feedback: data?.feedback || [],
        authDetails: data || {},
        error,
        loading,
        refetch,
    };
};

export default useUser;
