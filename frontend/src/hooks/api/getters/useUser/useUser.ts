import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IPermission } from '../../../../interfaces/user';
import handleErrorResponses from '../httpErrorResponseHandler';

export const USER_CACHE_KEY = `api/admin/user`;
const NO_AUTH_USERNAME = 'unknown';

const useUser = (
    options: SWRConfiguration = {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 15000,
    }
) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('User info'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(USER_CACHE_KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(USER_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    let user = data?.user;
    // Set a user id if no authentication is on
    // to cancel the loader.

    if (data && user?.username === NO_AUTH_USERNAME) {
        user = { ...user, id: 1 };
    }

    return {
        user: user || {},
        permissions: (data?.permissions || []) as IPermission[],
        feedback: data?.feedback || [],
        splash: data?.splash || {},
        authDetails: data || undefined,
        error,
        loading,
        refetch,
    };
};

export default useUser;
