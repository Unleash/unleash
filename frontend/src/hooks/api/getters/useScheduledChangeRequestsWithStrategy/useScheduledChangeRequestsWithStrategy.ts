import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export const useScheduledChangeRequestsWithStrategy = (
    project: string,
    strategyId: string,
) => {
    const { data, error, mutate } = useEnterpriseSWR<IChangeRequest[]>(
        [],
        formatApiPath(
            `api/admin/projects/${project}/change-requests/scheduled?strategyId=${strategyId}`,
        ),
        fetcher,
    );

    return {
        changeRequests: data,
        loading: !error && !data,
        refetch: mutate,
        error,
    };
};
