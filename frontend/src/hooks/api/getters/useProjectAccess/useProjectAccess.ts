import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IProjectRole } from 'interfaces/role';
import { IGroup } from 'interfaces/group';
import { IUser } from 'interfaces/user';

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

    const { data, error } = useSWR<IProjectAccessOutput>(
        CACHE_KEY,
        fetcher,
        options
    );

    const [loading, setLoading] = useState(!error && !data);

    const refetchProjectAccess = () => {
        mutate(CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    // TODO: Remove this and replace `mockData` back for `data` @79. This mocks what a group looks like when returned along with the access.
    // const { groups } = useGroups();
    // const mockData = useMemo(
    //     () => ({
    //         ...data,
    //         groups: groups?.map(group => ({
    //             ...group,
    //             roleId: 4,
    //         })) as IProjectAccessGroup[],
    //     }),
    //     [data, groups]
    // );

    return {
        access: data ? data : { roles: [], users: [], groups: [] },
        error,
        loading,
        refetchProjectAccess,
    };
};

export default useProjectAccess;
