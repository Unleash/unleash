import { getUserProjectRolesFetcher } from './getUserProjectRolesFetcher';
import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import type { IUserProjectRoles } from '../../../../interfaces/userProjectRoles';

export const useUserProjectRoles = (
    projectId: string,
    options: SWRConfiguration = {},
) => {
    const { KEY, fetcher } = getUserProjectRolesFetcher(projectId);
    const { data, error, mutate } = useSWR<IUserProjectRoles>(
        KEY,
        fetcher,
        options,
    );

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);
    return {
        roles: data?.roles || [],
        loading: !error && !data,
        error,
        refetch,
    };
};
