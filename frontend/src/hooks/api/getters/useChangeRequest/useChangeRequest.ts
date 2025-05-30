import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';

export const useChangeRequest = (projectId: string, id: string) => {
    const { data, error, mutate } = useSWR<ChangeRequestType>(
        formatApiPath(`api/admin/projects/${projectId}/change-requests/${id}`),
        fetcher,
        { refreshInterval: 15000 },
    );

    return {
        data,
        loading: !error && !data,
        refetchChangeRequest: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then((res) => res.json());
};
