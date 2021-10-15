import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IPermission } from '../../../../interfaces/user';
import handleErrorResponses from '../httpErrorResponseHandler';

const useUser = () => {
    const KEY = `api/admin/user`;
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user`);
        return fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('User info')).then(res => res.json());
    };

    const { data, error } = useSWR(KEY, fetcher);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        user: data?.user || {},
        permissions: (data?.permissions || []) as IPermission[],
        feedback: data?.feedback || [],
        error,
        loading,
        refetch,
    };
};

export default useUser;
