import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { IRole } from 'interfaces/role';
import type { IServiceAccount } from 'interfaces/service-account';
import type { IAccessOverviewPermission } from 'interfaces/permissions';
import type { IPermission } from 'interfaces/user';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';

interface IServiceAccountAccessOverview {
    root: IAccessOverviewPermission[];
    project: IAccessOverviewPermission[];
    environment: IAccessOverviewPermission[];
}

interface IServiceAccountAccessOverviewResponse {
    overview: IServiceAccountAccessOverview;
    projectRoles: IRole[];
    rootRole: IRole;
    serviceAccount: IServiceAccount;
    permissions: IPermission[];
}

interface IServiceAccountAccessOverviewOutput
    extends Partial<IServiceAccountAccessOverviewResponse> {
    permissions: IPermission[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

export const useServiceAccountAccessOverview = (
    id?: number,
    project?: string,
    environment?: string,
): IServiceAccountAccessOverviewOutput => {
    const queryParams = `${project ? `?project=${project}` : ''}${
        environment ? `${project ? '&' : '?'}environment=${environment}` : ''
    }`;
    const url = `api/admin/service-account/${id}/permissions${queryParams}`;

    const { data, error, mutate } = useConditionalSWR<
        IServiceAccountAccessOverviewResponse | undefined
    >(Boolean(id), undefined, formatApiPath(url), fetcher);

    return useMemo(
        () => ({
            overview: data?.overview,
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
        .then(handleErrorResponses('Service account access overview'))
        .then((res) => res.json());
};
