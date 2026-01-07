import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ActionableChangeRequestsSchema } from 'openapi/models/actionableChangeRequestsSchema';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';

interface IUseActionableChangeRequestsOutput {
    total?: number;
    refetch: () => void;
}

export const useActionableChangeRequests = (
    projectId: string,
): IUseActionableChangeRequestsOutput => {
    const { data, mutate } = useEnterpriseSWR<ActionableChangeRequestsSchema>(
        { total: 0 },
        formatApiPath(
            `api/admin/projects/${projectId}/change-requests/actionable`,
        ),
        fetcher,
    );

    return {
        total: data?.total,
        refetch: mutate,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Actionable change requests'))
        .then((res) => res.json());
};
