import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { IUser } from 'interfaces/user';
import type { IRole } from 'interfaces/role';
import type { ActionableChangeRequestsSchema } from 'openapi/models/actionableChangeRequestsSchema';

interface IUseUsersOutput {
    users: IUser[];
    roles: IRole[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useActionableChangeRequests = (
    projectId: string,
): IUseUsersOutput => {
    const { data, error, mutate } = useSWR<ActionableChangeRequestsSchema>(
        formatApiPath(
            `api/admin/projects/${projectId}/change-requests/actionable`,
        ),
        fetcher,
    );

    return useMemo(
        () => ({
            users: data?.users ?? [],
            roles: data?.rootRoles ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Users'))
        .then((res) => res.json());
};
