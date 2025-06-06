import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { IRole } from 'interfaces/role';
import type { IGroup } from 'interfaces/group';
import type { IUser } from 'interfaces/user';
import { mapGroupUsers } from '../useGroup/useGroup.js';
import type { IServiceAccount } from 'interfaces/service-account';

export enum ENTITY_TYPE {
    USER = 'USERS',
    GROUP = 'GROUPS',
    SERVICE_ACCOUNT = 'SERVICE ACCOUNTS',
}

export interface IProjectAccess {
    entity: IProjectAccessUser | IProjectAccessGroup;
    type: ENTITY_TYPE;
}

export interface IProjectAccessUser extends IUser {
    roles: number[];
    roleId: number;
}

export interface IProjectAccessGroup extends IGroup {
    roles: number[];
    roleId: number;
}

export interface IProjectAccessOutput {
    users: IProjectAccessUser[];
    groups: IProjectAccessGroup[];
    roles: IRole[];
    rows: IProjectAccess[];
}

const useProjectAccess = (
    projectId: string,
    options: SWRConfiguration = {},
) => {
    const path = formatApiPath(`api/admin/projects/${projectId}/access`);
    const fetcher = () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('project access'))
            .then((res) => res.json());
    };

    const CACHE_KEY = `api/admin/projects/${projectId}/users`;

    const { data, error } = useSWR(CACHE_KEY, fetcher, options);

    const [loading, setLoading] = useState(!error && !data);

    const refetchProjectAccess = () => {
        mutate(CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const access: IProjectAccessOutput | undefined = useMemo(() => {
        if (data) {
            return formatAccessData({
                roles: data.roles,
                users: (data.users as IUser[]).filter(
                    ({ accountType }) => !accountType || accountType === 'User',
                ),
                serviceAccounts: (data.users as IUser[]).filter(
                    ({ accountType }) => accountType === 'Service Account',
                ),
                groups:
                    data?.groups.map((group: any) => ({
                        ...group,
                        users: mapGroupUsers(group.users ?? []),
                    })) ?? [],
            });
        }
    }, [data]);

    return {
        access,
        error,
        loading,
        refetchProjectAccess,
    };
};

const formatAccessData = (access: any): IProjectAccessOutput => {
    const users = access.users || [];
    const serviceAccounts = access.serviceAccounts || [];
    const groups = access.groups || [];
    return {
        ...access,
        rows: [
            ...users.map((user: IUser) => ({
                entity: user,
                type: ENTITY_TYPE.USER,
            })),
            ...serviceAccounts.map((serviceAccount: IServiceAccount) => ({
                entity: serviceAccount,
                type: ENTITY_TYPE.SERVICE_ACCOUNT,
            })),
            ...groups.map((group: IGroup) => ({
                entity: group,
                type: ENTITY_TYPE.GROUP,
            })),
        ],
    };
};

export default useProjectAccess;
