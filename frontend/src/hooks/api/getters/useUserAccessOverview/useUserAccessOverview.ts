import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import useSWR from 'swr';
import type { IRole } from 'interfaces/role';
import type { IUser } from 'interfaces/user';
import type { IAccessOverviewPermission } from 'interfaces/permissions';

interface IUserAccessOverview {
    root: IAccessOverviewPermission[];
    project: IAccessOverviewPermission[];
    environment: IAccessOverviewPermission[];
}

interface IUserAccessOverviewResponse {
    overview: IUserAccessOverview;
    projectRoles: IRole[];
    rootRole: IRole;
    user: IUser;
}

interface IUserAccessOverviewOutput
    extends Partial<IUserAccessOverviewResponse> {
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useUserAccessOverview = (
    id: string,
    project?: string,
    environment?: string,
): IUserAccessOverviewOutput => {
    const queryParams = `${project ? `?project=${project}` : ''}${
        environment ? `${project ? '&' : '?'}environment=${environment}` : ''
    }`;
    const url = `api/admin/user-admin/${id}/permissions${queryParams}`;

    const { data, error, mutate } = useSWR<IUserAccessOverviewResponse>(
        formatApiPath(url),
        fetcher,
    );

    return useMemo(
        () => ({
            overview: data?.overview,
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
