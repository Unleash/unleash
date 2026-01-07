import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    SearchChangeRequestsParams,
    ChangeRequestSearchResponseSchema,
} from 'openapi';
import { useClearSWRCache } from 'hooks/useClearSWRCache';

type UseChangeRequestSearchOutput = {
    loading: boolean;
    initialLoad: boolean;
    error: string;
    refetch: () => void;
} & ChangeRequestSearchResponseSchema;

type CacheValue = {
    total: number;
    initialLoad: boolean;
    [key: string]: number | boolean;
};

type InternalCache = Record<string, CacheValue>;

const fallbackData: ChangeRequestSearchResponseSchema = {
    changeRequests: [],
    total: 0,
};

const SWR_CACHE_SIZE = 10;
const PATH = 'api/admin/search/change-requests?';

export type SearchChangeRequestsInput = {
    [K in keyof SearchChangeRequestsParams]?:
        | SearchChangeRequestsParams[K]
        | null;
};

const createChangeRequestSearch = () => {
    const internalCache: InternalCache = {};

    const initCache = (id: string) => {
        internalCache[id] = {
            total: 0,
            initialLoad: true,
        };
    };

    const set = (id: string, key: string, value: number | boolean) => {
        if (!internalCache[id]) {
            initCache(id);
        }
        internalCache[id][key] = value;
    };

    const get = (id: string) => {
        if (!internalCache[id]) {
            initCache(id);
        }
        return internalCache[id];
    };

    return (
        params: SearchChangeRequestsInput,
        options: SWRConfiguration = {},
        cachePrefix: string = '',
    ): UseChangeRequestSearchOutput => {
        const { KEY, fetcher } = getChangeRequestSearchFetcher(params);
        const swrKey = `${cachePrefix}${KEY}`;
        const cacheId = 'global';
        useClearSWRCache({
            currentKey: swrKey,
            clearPrefix: PATH,
            cacheSize: SWR_CACHE_SIZE,
        });

        useEffect(() => {
            initCache(cacheId);
        }, []);

        const { data, error, mutate, isLoading } =
            useSWR<ChangeRequestSearchResponseSchema>(swrKey, fetcher, options);

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        const cacheValues = get(cacheId);

        if (data?.total !== undefined) {
            set(cacheId, 'total', data.total);
        }

        if (!isLoading && cacheValues.initialLoad) {
            set(cacheId, 'initialLoad', false);
        }

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: isLoading,
            error,
            refetch,
            total: cacheValues.total,
            initialLoad: isLoading && cacheValues.initialLoad,
        };
    };
};

export const DEFAULT_PAGE_LIMIT = 25;

const getChangeRequestSearchFetcher = (params: SearchChangeRequestsInput) => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(
                    (param): param is [string, string | number] => !!param[1],
                )
                .map(([key, value]) => [key, value.toString()]),
        ),
    ).toString();
    const KEY = `${PATH}${urlSearchParams}`;
    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Change request search'))
            .then((res) => res.json());
    };

    return {
        fetcher,
        KEY,
    };
};

export const useChangeRequestSearch = createChangeRequestSearch();
