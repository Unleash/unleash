import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import {
    IEnvironmentResponse,
    IProjectEnvironment,
} from 'interfaces/environments';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseProjectEnvironmentsOutput {
    environments: IProjectEnvironment[];
    loading: boolean;
    error?: Error;
    refetchEnvironments: () => Promise<void>;
}

export const useProjectEnvironments = (
    projectId: string
): IUseProjectEnvironmentsOutput => {
    const { data, error, mutate } = useSWR<IProjectEnvironment[]>(
        formatApiPath(`api/admin/environments/project/${projectId}`),
        fetcher
    );

    const environments = useMemo(() => {
        return data || [];
    }, [data]);

    const refetchEnvironments = useCallback(async () => {
        await mutate();
    }, [mutate]);

    return {
        environments,
        refetchEnvironments,
        loading: !error && !data,
        error,
    };
};

const fetcher = async (path: string): Promise<IProjectEnvironment[]> => {
    const res: IEnvironmentResponse = await fetch(path)
        .then(handleErrorResponses('Environments'))
        .then(res => res.json());

    return res.environments.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
    });
};
