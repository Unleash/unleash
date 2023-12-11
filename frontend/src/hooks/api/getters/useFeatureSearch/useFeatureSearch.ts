import useSWR, { SWRConfiguration, useSWRConfig } from 'swr';
import { useCallback, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { SearchFeaturesParams, SearchFeaturesSchema } from 'openapi';

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

/**
 With dynamic search and filter parameters we want to prevent cache from growing extensively.
 We only keep the latest cache key `currentKey` and remove all other entries identified
 by the `clearPrefix`
 */
const useClearSWRCache = (currentKey: string, clearPrefix: string) => {
    const { cache } = useSWRConfig();
    const keys = [...cache.keys()];
    keys.filter((key) => key !== currentKey && key.startsWith(clearPrefix)).map(
        (key) => cache.delete(key),
    );
};

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
    ): UseFeatureSearchOutput => {
        const { KEY, fetcher } = getFeatureSearchFetcher(params);
        const cacheId = params.project || '';
        useClearSWRCache(KEY, 'api/admin/search/features?');

        useEffect(() => {
            initCache(params.project || '');
        }, []);

        const { data, error, mutate, isLoading } = useSWR<SearchFeaturesSchema>(
            KEY,
            fetcher,
            options,
        );

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        const cacheValues = get(cacheId);

        if (data?.total) {
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

export const useFeatureSearch = createFeatureSearch();

const getFeatureSearchFetcher = (params: SearchFeaturesParams) => {
    const urlSearchParams = new URLSearchParams(
        Array.from(
            Object.entries(params)
                .filter(([_, value]) => !!value)
                .map(([key, value]) => [key, value.toString()]), // TODO: parsing non-string parameters
        ),
    ).toString();
    const KEY = `api/admin/search/features?${urlSearchParams}`;
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
