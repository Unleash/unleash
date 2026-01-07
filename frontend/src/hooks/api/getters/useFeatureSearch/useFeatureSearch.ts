import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { SearchFeaturesParams, SearchFeaturesSchema } from 'openapi';
import { useClearSWRCache } from 'hooks/useClearSWRCache';

type UseFeatureSearchOutput = {
    loading: boolean;
    initialLoad: boolean;
    error: string;
    refetch: () => void;
} & SearchFeaturesSchema;

type CacheValue = {
    total: number;
    initialLoad: boolean;
    [key: string]: number | boolean;
};

type InternalCache = Record<string, CacheValue>;

const fallbackData: SearchFeaturesSchema = {
    features: [],
    total: 0,
};

const SWR_CACHE_SIZE = 10;
const PATH = 'api/admin/search/features?';

const createFeatureSearch = () => {
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
        params: SearchFeaturesParams,
        options: SWRConfiguration = {},
        cachePrefix: string = '',
    ): UseFeatureSearchOutput => {
        const { KEY, fetcher } = getFeatureSearchFetcher(params);
        const swrKey = `${cachePrefix}${KEY}`;
        const cacheId = params.project || '';
        useClearSWRCache({
            currentKey: swrKey,
            clearPrefix: PATH,
            cacheSize: SWR_CACHE_SIZE,
        });

        useEffect(() => {
            initCache(cacheId);
        }, []);

        const { data, error, mutate, isLoading } = useSWR<SearchFeaturesSchema>(
            swrKey,
            fetcher,
            options,
        );

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

export const getFeatureSearchFetcher = (params: SearchFeaturesParams) => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(([_, value]) => !!value)
                .map(([key, value]) => [key, value.toString()]) // TODO: parsing non-string parameters
                .toSorted(),
        ),
    ).toString();
    const KEY = `${PATH}${urlSearchParams}`;
    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Feature search'))
            .then((res) => res.json());
    };

    return {
        fetcher,
        KEY,
    };
};

export const useFeatureSearch = createFeatureSearch();
