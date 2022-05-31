import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export const useUsers = () => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/user-admin`),
        fetcher
    );

    return useMemo(
        () => ({
            users: data?.users ?? [],
            roles: data?.rootRoles ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Users'))
        .then(res => res.json());
};
