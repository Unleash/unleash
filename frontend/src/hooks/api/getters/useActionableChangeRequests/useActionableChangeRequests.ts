import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { ActionableChangeRequestsSchema } from 'openapi/models/actionableChangeRequestsSchema';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR';

type RemoteData<T> =
    | { state: 'error'; error: Error }
    | { state: 'loading' }
    | { state: 'success'; data: T };

export const useActionableChangeRequests = (
    projectId: string,
): RemoteData<ActionableChangeRequestsSchema> => {
    const { data, error } = useEnterpriseSWR<ActionableChangeRequestsSchema>(
        { total: 0 },
        formatApiPath(
            `api/admin/projects/${projectId}/change-requests/actionable`,
        ),
        fetcher,
    );

    if (data) {
        return { state: 'success', data };
    }
    if (error) {
        return { state: 'error', error };
    }
    return { state: 'loading' };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Actionable change requests'))
        .then((res) => res.json());
};
