import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';

export const useUserAccessMatrix = (
    id: string,
    project?: string,
    environment?: string,
    options: SWRConfiguration = {},
) => {
    const url = `api/admin/user-admin/${id}/permissions${
        project ? `?project=${project}` : ''
    }${environment ? `${project ? '&' : '?'}environment=${environment}` : ''}`;
    const fetcher = () => {
        const path = formatApiPath(url);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('AccessMatrix'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR(url, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(url);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        ...data,
        error,
        loading,
        refetch,
    };
};
