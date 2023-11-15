import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useEffect } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { translateToQueryParams } from './searchToQueryParams';

type IFeatureSearchResponse = {
    features: IFeatureToggleListItem[];
    total: number;
};

interface IUseFeatureSearchOutput {
    features: IFeatureToggleListItem[];
    total: number;
    loading: boolean;
    initialLoad: boolean;
    error: string;
    refetch: () => void;
}

type CacheValue = {
    total: number;
    initialLoad: boolean;
    [key: string]: number | boolean;
};

type InternalCache = Record<string, CacheValue>;

const fallbackData: {
    features: IFeatureToggleListItem[];
    total: number;
} = {
    features: [],
    total: 0,
};

const createFeatureSearch = () => {
    const internalCache: InternalCache = {};

    const initCache = (projectId: string) => {
        internalCache[projectId] = {
            total: 0,
            initialLoad: true,
        };
    };

    const set = (projectId: string, key: string, value: number | boolean) => {
        if (!internalCache[projectId]) {
            initCache(projectId);
        }
        internalCache[projectId][key] = value;
    };

    const get = (projectId: string) => {
        if (!internalCache[projectId]) {
            initCache(projectId);
        }
        return internalCache[projectId];
    };

    return (
        offset: number,
        limit: number,
        projectId = '',
        searchValue = '',
        options: SWRConfiguration = {},
    ): IUseFeatureSearchOutput => {
        const { KEY, fetcher } = getFeatureSearchFetcher(
            projectId,
            offset,
            limit,
            searchValue,
        );

        useEffect(() => {
            initCache(projectId);
        }, []);

        const { data, error, mutate, isLoading } =
            useSWR<IFeatureSearchResponse>(KEY, fetcher, options);

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        const cacheValues = get(projectId);

        if (data?.total) {
            set(projectId, 'total', data.total);
        }

        if (!isLoading && cacheValues.initialLoad) {
            set(projectId, 'initialLoad', false);
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

export const useFeatureSearch = createFeatureSearch();

const getFeatureSearchFetcher = (
    projectId: string,
    offset: number,
    limit: number,
    searchValue: string,
) => {
    const searchQueryParams = translateToQueryParams(searchValue);
    const KEY = `api/admin/search/features?projectId=${projectId}&offset=${offset}&limit=${limit}&${searchQueryParams}`;
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
