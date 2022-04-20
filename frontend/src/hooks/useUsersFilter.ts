import { IUser } from 'interfaces/user';
import React, { useMemo } from 'react';
import { getBasePath } from 'utils/formatPath';
import { createGlobalStateHook } from 'hooks/useGlobalState';

export interface IUsersFilter {
    query?: string;
}

export interface IUsersFilterOutput {
    filtered: IUser[];
    filter: IUsersFilter;
    setFilter: React.Dispatch<React.SetStateAction<IUsersFilter>>;
}

// Store the users filter state globally, and in localStorage.
// When changing the format of IUsersFilter, change the version as well.
const useUsersFilterState = createGlobalStateHook<IUsersFilter>(
    `${getBasePath()}:useUsersFilter:v1`,
    { query: '' }
);

export const useUsersFilter = (users: IUser[]): IUsersFilterOutput => {
    const [filter, setFilter] = useUsersFilterState();

    const filtered = useMemo(() => {
        return filterUsers(users, filter);
    }, [users, filter]);

    return {
        setFilter,
        filter,
        filtered,
    };
};

const filterUsers = (users: IUser[], filter: IUsersFilter): IUser[] => {
    return filterUsersByQuery(users, filter);
};

const filterUsersByQuery = (users: IUser[], filter: IUsersFilter): IUser[] => {
    if (!filter.query) {
        return users;
    }

    // Try to parse the search query as a RegExp.
    // Return all users if it can't be parsed.
    try {
        const regExp = new RegExp(filter.query, 'i');
        return users.filter(user => filterUserByRegExp(user, regExp));
    } catch (err) {
        if (err instanceof SyntaxError) {
            return users;
        } else {
            throw err;
        }
    }
};

const filterUserByRegExp = (user: IUser, regExp: RegExp): boolean =>
    regExp.test(user.name ?? '') ||
    regExp.test(user.username ?? user.email ?? '');
