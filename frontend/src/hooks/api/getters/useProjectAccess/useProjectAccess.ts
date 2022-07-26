import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IProjectRole } from 'interfaces/role';
import { IGroup } from 'interfaces/group';
import { IUser } from 'interfaces/user';
import { useGroups } from '../useGroups/useGroups';
import { mapGroupUsers } from '../useGroup/useGroup';

export enum ENTITY_TYPE {
    USER = 'USERS',
    GROUP = 'GROUPS',
}

export interface IProjectAccess {
    entity: IProjectAccessUser | IProjectAccessGroup;
    type: ENTITY_TYPE;
}

export interface IProjectAccessUser extends IUser {
    roleId: number;
}

export interface IProjectAccessGroup extends IGroup {
    roleId: number;
}

export interface IProjectAccessOutput {
    users: IProjectAccessUser[];
    groups: IProjectAccessGroup[];
    roles: IProjectRole[];
}

const useProjectAccess = (
    projectId: string,
    options: SWRConfiguration = {}
) => {
    const path = formatApiPath(`api/admin/projects/${projectId}/access`);
    const fetcher = () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('project access'))
            .then(res => res.json());
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

    let access: IProjectAccessOutput = data
        ? {
              roles: data.roles,
              users: data.users,
              groups:
                  data?.groups.map((group: any) => ({
                      ...group,
                      users: mapGroupUsers(group.users ?? []),
                  })) ?? [],
          }
        : { roles: [], users: [], groups: [] };
    return {
        access: access,
        error,
        loading,
        refetchProjectAccess,
    };
};

export default useProjectAccess;
