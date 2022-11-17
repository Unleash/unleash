import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import useUiConfig from '../useUiConfig/useUiConfig';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then(res => res.json());
};

export const useProjectChangeRequests = (project: string) => {
    const { isOss } = useUiConfig();
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/projects/${project}/change-requests`),
        isOss() ? () => Promise.resolve([]) : fetcher
    );

    return useMemo(
        () => ({
            changeRequests: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};
