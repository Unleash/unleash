import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IApiToken } from '../useApiTokens/useApiTokens';

export const useProjectApiTokens = (
    project: string,
    options: SWRConfiguration = {}
) => {
    const path = formatApiPath(`api/admin/projects/${project}/api-tokens`);
    const { data, error, mutate } = useSWR<IApiToken[]>(path, fetcher, options);

    const tokens = useMemo(() => {
        return data ?? [];
    }, [data]);

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        tokens,
        error,
        loading: !error && !data,
        refetch,
    };
};

const fetcher = async (path: string): Promise<IApiToken[]> => {
    const res = await fetch(path).then(
        handleErrorResponses('Project Api tokens')
    );
    const data = await res.json();
    return data.tokens;
};
