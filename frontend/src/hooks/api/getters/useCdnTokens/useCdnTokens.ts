import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { CdnApiTokensSchema } from 'openapi/index.js';

export const useCdnTokens = (options: SWRConfiguration = {}) => {
    const path = formatApiPath(`api/admin/cdn/tokens`);
    const { data, error, mutate } = useSWR<CdnApiTokensSchema>(
        path,
        fetcher,
        options,
    );

    const tokens = useMemo(() => {
        return data?.tokens ?? [];
    }, [data?.tokens]);

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

const fetcher = async (path: string): Promise<CdnApiTokensSchema> => {
    const res = await fetch(path).then(handleErrorResponses('Api tokens'));
    const data = await res.json();
    return data;
};
