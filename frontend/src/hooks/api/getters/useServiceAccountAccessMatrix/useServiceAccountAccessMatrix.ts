import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import useSWR from 'swr';
import { IRole } from 'interfaces/role';
import { IServiceAccount } from 'interfaces/service-account';
import { IMatrixPermission } from 'interfaces/permissions';
import { IPermission } from 'interfaces/user';

interface IServiceAccountAccessMatrix {
    root: IMatrixPermission[];
    project: IMatrixPermission[];
    environment: IMatrixPermission[];
}

interface IServiceAccountAccessMatrixResponse {
    matrix: IServiceAccountAccessMatrix;
    projectRoles: IRole[];
    rootRole: IRole;
    serviceAccount: IServiceAccount;
    permissions: IPermission[];
}

interface IServiceAccountAccessMatrixOutput
    extends Partial<IServiceAccountAccessMatrixResponse> {
    permissions: IPermission[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useServiceAccountAccessMatrix = (
    id: number,
    project?: string,
    environment?: string,
): IServiceAccountAccessMatrixOutput => {
    const queryParams = `${project ? `?project=${project}` : ''}${
        environment ? `${project ? '&' : '?'}environment=${environment}` : ''
    }`;
    const url = `api/admin/service-account/${id}/permissions${queryParams}`;

    const { data, error, mutate } = useSWR<IServiceAccountAccessMatrixResponse>(
        formatApiPath(url),
        fetcher,
    );

    return useMemo(
        () => ({
            matrix: data?.matrix,
            projectRoles: data?.projectRoles,
            rootRole: data?.rootRole,
            serviceAccount: data?.serviceAccount,
            permissions: data?.permissions || [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Service account access matrix'))
        .then((res) => res.json());
};
