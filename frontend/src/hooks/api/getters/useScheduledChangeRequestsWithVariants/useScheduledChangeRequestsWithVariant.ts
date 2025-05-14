import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';
import type { ScheduledChangeRequestViewModel } from '../useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy.js';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export const useScheduledChangeRequestsWithVariant = (
    project: string,
    feature: string,
) => {
    const { data, error, mutate } = useEnterpriseSWR<
        ScheduledChangeRequestViewModel[]
    >(
        [],
        formatApiPath(
            `api/admin/projects/${project}/change-requests/scheduled?variantForFlag=${feature}`,
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
