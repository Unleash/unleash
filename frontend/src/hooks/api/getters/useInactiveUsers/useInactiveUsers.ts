import handleErrorResponses from '../httpErrorResponseHandler.js';
import { formatApiPath } from '../../../../utils/formatPath.js';
import useSWR from 'swr';
import { useMemo } from 'react';

export interface IInactiveUser {
    id: number;
    username?: string;
    email?: string;
    name?: string;
    seenAt?: Date;
    patSeenAt?: Date;
    createdAt?: Date;
}
export interface IUseInactiveUsersOutput {
    inactiveUsers: IInactiveUser[];
    totalInactiveUsers: number;
    refetchInactiveUsers: () => void;
    loading: boolean;
    error?: Error;
}

export const useInactiveUsers = (
    limit: number = 50,
    offset: number = 0,
): IUseInactiveUsersOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath(
            `api/admin/user-admin/inactive?limit=${limit}&offset=${offset}`,
        ),
        fetcher,
    );

    return useMemo(
        () => ({
            inactiveUsers: data?.inactiveUsers ?? [],
            totalInactiveUsers: data?.totalInactiveUsers ?? 0,
            error,
            refetchInactiveUsers: () => mutate(),
            loading: !error && !data,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('User'))
        .then((res) => res.json());
};
