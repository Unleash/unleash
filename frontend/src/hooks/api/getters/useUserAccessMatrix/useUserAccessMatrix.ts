import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import useSWR from 'swr';
import type { IRole } from 'interfaces/role';
import type { IUser } from 'interfaces/user';
import type { IMatrixPermission } from 'interfaces/permissions';

interface IUserAccessMatrix {
    root: IMatrixPermission[];
    project: IMatrixPermission[];
    environment: IMatrixPermission[];
}

interface IUserAccessMatrixResponse {
    matrix: IUserAccessMatrix;
    projectRoles: IRole[];
    rootRole: IRole;
    user: IUser;
}

interface IUserAccessMatrixOutput extends Partial<IUserAccessMatrixResponse> {
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useUserAccessMatrix = (
    id: string,
    project?: string,
    environment?: string,
): IUserAccessMatrixOutput => {
    const queryParams = `${project ? `?project=${project}` : ''}${
        environment ? `${project ? '&' : '?'}environment=${environment}` : ''
    }`;
    const url = `api/admin/user-admin/${id}/permissions${queryParams}`;

    const { data, error, mutate } = useSWR<IUserAccessMatrixResponse>(
        formatApiPath(url),
        fetcher,
    );

    return useMemo(
        () => ({
            matrix: data?.matrix,
            projectRoles: data?.projectRoles,
            rootRole: data?.rootRole,
            user: data?.user,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('User access matrix'))
        .then((res) => res.json());
};
