import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export type ChangeRequestIdentityData = {
    id: number;
    title?: string;
};

export const useScheduledChangeRequestsWithStrategy = (
    project: string,
    strategyId: string,
) => {
    const { data, error, mutate } = useEnterpriseSWR<
        ChangeRequestIdentityData[]
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
