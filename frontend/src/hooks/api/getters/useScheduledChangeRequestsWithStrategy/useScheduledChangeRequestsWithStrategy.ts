import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export type ScheduledChangeRequestViewModel = {
    id: number;
    environment: string;
    title?: string;
};

export const useScheduledChangeRequestsWithStrategy = (
    project: string,
    strategyId: string,
) => {
    const { data, error, mutate } = useEnterpriseSWR<
        ScheduledChangeRequestViewModel[]
    >(
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
