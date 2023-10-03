import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IGroup } from 'interfaces/group';
import { mapGroupUsers } from 'hooks/api/getters/useGroup/useGroup';

export interface IUseGroupsOutput {
    groups?: IGroup[];
    refetchGroups: () => void;
    loading: boolean;
    error?: Error;
}

export const useGroups = (): IUseGroupsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/groups`),
        fetcher
    );

    return useMemo(
        () => ({
            groups:
                data?.groups.map((group: any) => ({
                    ...group,
                    users: mapGroupUsers(group.users ?? []),
                })) ?? [],
            loading: !error && !data,
            refetchGroups: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Groups'))
        .then(res => res.json());
};
