import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useProjectRole = (id: string, options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/roles/${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('project role'))
            .then(res => res.json());
    };

    const { data, error } = useSWR(`api/admin/roles/${id}`, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(`api/admin/roles/${id}`);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        role: data ? data : {},
        error,
        loading,
        refetch,
    };
};

export default useProjectRole;
