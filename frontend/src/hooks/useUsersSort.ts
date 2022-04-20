import { IUser } from 'interfaces/user';
import React, { useMemo } from 'react';
import { getBasePath } from 'utils/formatPath';
import { createPersistentGlobalStateHook } from './usePersistentGlobalState';
import useUsers from 'hooks/api/getters/useUsers/useUsers';
import IRole from 'interfaces/role';

export type UsersSortType = 'created' | 'name' | 'role';

export interface IUsersSort {
    type: UsersSortType;
    desc?: boolean;
}

export interface IUsersSortOutput {
    sort: IUsersSort;
    sorted: IUser[];
    setSort: React.Dispatch<React.SetStateAction<IUsersSort>>;
}

export interface IUsersFilterSortOption {
    type: UsersSortType;
    name: string;
}

// Store the users sort state globally, and in localStorage.
// When changing the format of IUsersSort, change the version as well.
const useUsersSortState = createPersistentGlobalStateHook<IUsersSort>(
    `${getBasePath()}:useUsersSort:v1`,
    { type: 'created', desc: false }
);

export const useUsersSort = (users: IUser[]): IUsersSortOutput => {
    const [sort, setSort] = useUsersSortState();
    const { roles } = useUsers();

    const sorted = useMemo(() => {
        return sortUsers(users, roles, sort);
    }, [users, roles, sort]);

    return {
        setSort,
        sort,
        sorted,
    };
};

export const createUsersFilterSortOptions = (): IUsersFilterSortOption[] => {
    return [
        { type: 'created', name: 'Created' },
        { type: 'name', name: 'Name' },
        { type: 'role', name: 'Role' },
    ];
};

const sortAscendingUsers = (
    users: IUser[],
    roles: IRole[],
    sort: IUsersSort
): IUser[] => {
    switch (sort.type) {
        case 'created':
            return sortByCreated(users);
        case 'name':
            return sortByName(users);
        case 'role':
            return sortByRole(users, roles);
        default:
            console.error(`Unknown feature sort type: ${sort.type}`);
            return users;
    }
};

const sortUsers = (
    users: IUser[],
    roles: IRole[],
    sort: IUsersSort
): IUser[] => {
    const sorted = sortAscendingUsers(users, roles, sort);

    if (sort.desc) {
        return [...sorted].reverse();
    }

    return sorted;
};

const sortByCreated = (users: Readonly<IUser[]>): IUser[] => {
    return [...users].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

const sortByName = (users: Readonly<IUser[]>): IUser[] => {
    return [...users].sort((a, b) => {
        const aName = a.name ?? '';
        const bName = b.name ?? '';
        return aName.localeCompare(bName);
    });
};

const sortByRole = (
    users: Readonly<IUser[]>,
    roles: Readonly<IRole[]>
): IUser[] => {
    return [...users].sort((a, b) =>
        getRoleName(a.rootRole, roles).localeCompare(
            getRoleName(b.rootRole, roles)
        )
    );
};

const getRoleName = (roleId: number, roles: Readonly<IRole[]>) => {
    const role = roles.find((role: IRole) => role.id === roleId);
    return role ? role.name : '';
};
