import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useUserInfo = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user-admin/${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Users'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(
        `api/admin/user-admin/${id}`,
        fetcher,
        options
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
