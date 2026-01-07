import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export const usePendingChangeRequestsForFeature = (
    project: string,
    featureName: string,
) => {
    const { data, error, mutate } = useEnterpriseSWR<ChangeRequestType[]>(
        [],
        formatApiPath(
            `api/admin/projects/${project}/change-requests/pending/${featureName}`,
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
