import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

const useUsers = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user-admin`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Users'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(`api/admin/user-admin`, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(`api/admin/user-admin`);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        users: data?.users || [],
        roles: data?.rootRoles || [],
        error,
        loading,
        refetch,
    };
};

export default useUsers;
