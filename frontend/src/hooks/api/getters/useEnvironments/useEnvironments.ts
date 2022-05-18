import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { IEnvironmentResponse, IEnvironment } from 'interfaces/environments';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseEnvironmentsOutput {
    environments: IEnvironment[];
    loading: boolean;
    error?: Error;
    mutateEnvironments: (environments: IEnvironment[]) => Promise<void>;
    refetchEnvironments: () => Promise<void>;
}

export const useEnvironments = (): IUseEnvironmentsOutput => {
    const { data, error, mutate } = useSWR<IEnvironmentResponse>(
        formatApiPath(`api/admin/environments`),
        fetcher
    );

    const environments = useMemo(() => {
        return data?.environments || [];
    }, [data]);

    const refetchEnvironments = useCallback(async () => {
        await mutate();
    }, [mutate]);

    const mutateEnvironments = useCallback(
        async (environments: IEnvironment[]) => {
            await mutate({ environments }, false);
        },
        [mutate]
    );

    return {
        environments,
        refetchEnvironments,
        mutateEnvironments,
        loading: !error && !data,
        error,
    };
};

const fetcher = (path: string): Promise<IEnvironmentResponse> => {
    return fetch(path)
        .then(handleErrorResponses('Environments'))
        .then(res => res.json());
};
