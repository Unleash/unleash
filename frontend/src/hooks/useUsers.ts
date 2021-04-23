import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';

const useUsers = () => {
    const fetcher = () =>
        fetch(`api/admin/user-admin`, {
            method: 'GET',
        }).then(res => res.json());

    const { data, error } = useSWR(`api/admin/user-admin`, fetcher);
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
