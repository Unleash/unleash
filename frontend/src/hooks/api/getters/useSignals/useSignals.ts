import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useClearSWRCache } from 'hooks/useClearSWRCache';
import type { ISignalQuerySignal } from 'interfaces/signal';

type SignalQueryParams = {
    from?: string;
    to?: string;
    offset?: string;
    limit?: string;
};

type SignalQueryResponse = {
    signals: ISignalQuerySignal[];
    total: number;
};

type UseSignalsOutput = {
    loading: boolean;
    initialLoad: boolean;
    error: string;
    refetch: () => void;
} & SignalQueryResponse;

type CacheValue = {
    total: number;
    initialLoad: boolean;
    [key: string]: number | boolean;
};

const fallbackData: SignalQueryResponse = {
    signals: [],
    total: 0,
};

const SWR_CACHE_SIZE = 10;
const PATH = 'api/admin/signals?';

const createSignalQuery = () => {
    const internalCache: CacheValue = {
        total: 0,
        initialLoad: true,
    };

    const set = (key: string, value: number | boolean) => {
        internalCache[key] = value;
    };

    return (
        params: SignalQueryParams,
        options: SWRConfiguration = {},
        cachePrefix: string = '',
    ): UseSignalsOutput => {
        const { KEY, fetcher } = getSignalQueryFetcher(params);
        const swrKey = `${cachePrefix}${KEY}`;
        useClearSWRCache(swrKey, PATH, SWR_CACHE_SIZE);

        const { data, error, mutate, isLoading } = useSWR<SignalQueryResponse>(
            swrKey,
            fetcher,
            options,
        );

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        if (data?.total !== undefined) {
            set('total', data.total);
        }

        if (!isLoading && internalCache.initialLoad) {
            set('initialLoad', false);
        }

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: isLoading,
            error,
            refetch,
            total: internalCache.total,
            initialLoad: isLoading && internalCache.initialLoad,
        };
    };
};

const getSignalQueryFetcher = (params: SignalQueryParams) => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(([_, value]) => !!value)
                .map(([key, value]) => [key, value.toString()]),
        ),
    ).toString();
    const KEY = `${PATH}${urlSearchParams}`;
    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Signal query'))
            .then((res) => res.json());
    };

    return {
        fetcher,
        KEY,
    };
};

export const useSignalQuery = createSignalQuery();
