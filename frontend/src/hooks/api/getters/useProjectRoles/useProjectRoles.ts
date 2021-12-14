import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useProjectRoles = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/roles`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('project roles'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(`api/admin/roles`, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(`api/admin/roles`);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        roles: data?.roles || [],
        error,
        loading,
        refetch,
    };
};

export default useProjectRoles;
