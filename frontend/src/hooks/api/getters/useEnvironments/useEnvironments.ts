import useSWR, { mutate } from 'swr';
import { useCallback, useMemo } from 'react';
import { IEnvironmentResponse } from 'interfaces/environments';
import { formatApiPath } from 'utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const PATH = formatApiPath(`api/admin/environments`);

export const useEnvironments = () => {
    const { data, error } = useSWR<IEnvironmentResponse>(PATH, fetcher);

    const refetchEnvironments = useCallback(
        (data?: IEnvironmentResponse, revalidate?: boolean) => {
            mutate(PATH, data, revalidate).catch(console.warn);
        },
        []
    );

    const environments = useMemo(() => {
        return data?.environments || [];
    }, [data]);

    return {
        environments,
        refetchEnvironments,
        loading: !error && !data,
        error,
    };
};

const fetcher = (): Promise<IEnvironmentResponse> => {
    return fetch(PATH)
        .then(handleErrorResponses('Environments'))
        .then(res => res.json());
};
