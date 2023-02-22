import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then(res => res.json());
};

export const usePendingChangeRequests = (project: string) => {
    const { data, error, mutate } = useEnterpriseSWR<IChangeRequest[]>(
        [],
        formatApiPath(`api/admin/projects/${project}/change-requests/pending`),
        fetcher
    );

    return {
        data,
        loading: !error && !data,
        refetch: mutate,
        error,
    };
};
