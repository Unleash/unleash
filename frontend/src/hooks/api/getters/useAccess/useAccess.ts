import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export const useAccess = () => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/user-admin/access`),
        fetcher
    );

    return useMemo(
        () => ({
            users: data?.users ?? [],
            groups: data?.groups ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Access'))
        .then(res => res.json());
};
