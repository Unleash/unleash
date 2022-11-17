import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import useUiConfig from '../useUiConfig/useUiConfig';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then(res => res.json());
};

export const useChangeRequestOpen = (project: string) => {
    const { isOss } = useUiConfig();
    const { data, error, mutate } = useSWR<IChangeRequest[]>(
        formatApiPath(`api/admin/projects/${project}/change-requests/open`),
        isOss() ? () => Promise.resolve([]) : fetcher
    );

    return useMemo(
        () => ({
            draft: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};
