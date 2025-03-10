import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { IWorkspace } from 'interfaces/workspace';

interface IUseWorkspacesOutput {
    workspaces: IWorkspace[];
    loading: boolean;
    error?: Error;
    refetch: () => void;
}

const useWorkspaces = (
    options: SWRConfiguration = {},
): IUseWorkspacesOutput => {
    const KEY = 'api/admin/workspaces';

    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Workspaces'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR<IWorkspace[]>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const workspaces = useMemo(() => {
        return data || [];
    }, [data]);

    return {
        workspaces,
        error,
        loading,
        refetch,
    };
};

export default useWorkspaces;
