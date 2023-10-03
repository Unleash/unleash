import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then(res => res.json());
};

export const useProjectChangeRequests = (project: string) => {
    const { data, error, mutate } = useEnterpriseSWR(
        [],
        formatApiPath(`api/admin/projects/${project}/change-requests`),
        fetcher
    );

    return useMemo(
        () => ({
            changeRequests: data,
            loading: !error && !data,
            refetch: mutate,
            error,
        }),
        [data, error, mutate]
    );
};
