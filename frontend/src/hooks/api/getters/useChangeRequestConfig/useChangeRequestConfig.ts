import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ChangeRequestConfig } from 'component/changeRequest/changeRequest.types';

export const useChangeRequestConfig = (projectId: string) => {
    const { data, error, mutate } = useSWR<ChangeRequestConfig>(
        formatApiPath(`api/admin/projects/${projectId}/change-requests/config`),
        fetcher
    );

    return {
        data: data || [],
        loading: !error && !data,
        refetchChangeRequestConfig: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then(res => res.json());
};
