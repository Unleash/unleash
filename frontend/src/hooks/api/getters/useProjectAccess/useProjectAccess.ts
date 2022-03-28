import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IProjectRole } from 'interfaces/role';

export interface IProjectAccessUser {
    id: number;
    imageUrl: string;
    isAPI: boolean;
    roleId: number;
    username?: string;
    name?: string;
    email?: string;
}

export interface IProjectAccessOutput {
    users: IProjectAccessUser[];
    roles: IProjectRole[];
}

const useProjectAccess = (
    projectId: string,
    options: SWRConfiguration = {}
) => {
    const path = formatApiPath(`api/admin/projects/${projectId}/users`);
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

    return {
        access: data ? data : { roles: [], users: [] },
        error,
        loading,
        refetchProjectAccess,
    };
};

export default useProjectAccess;
