import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useEffect } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { translateToQueryParams } from './searchToQueryParams';

type ISortingRules = {
    sortBy: string;
    sortOrder: string;
    favoritesFirst: boolean;
};

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
        sortingRules: ISortingRules,
        projectId = '',
        searchValue = '',
        options: SWRConfiguration = {},
    ): IUseFeatureSearchOutput => {
        const { KEY, fetcher } = getFeatureSearchFetcher(
            projectId,
            offset,
            limit,
            searchValue,
            sortingRules,
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

export const DEFAULT_PAGE_LIMIT = 25;

export const useFeatureSearch = createFeatureSearch();

const getFeatureSearchFetcher = (
    projectId: string,
    offset: number,
    limit: number,
    searchValue: string,
    sortingRules: ISortingRules,
) => {
    const searchQueryParams = translateToQueryParams(searchValue);
    const sortQueryParams = translateToSortQueryParams(sortingRules);
    const project = projectId ? `projectId=${projectId}&` : '';
    const KEY = `api/admin/search/features?${project}offset=${offset}&limit=${limit}&${searchQueryParams}&${sortQueryParams}`;
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

const translateToSortQueryParams = (sortingRules: ISortingRules) => {
    const { sortBy, sortOrder, favoritesFirst } = sortingRules;
    const sortQueryParams = `sortBy=${sortBy}&sortOrder=${sortOrder}&favoritesFirst=${favoritesFirst}`;
    return sortQueryParams;
};
