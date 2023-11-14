import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { translateToQueryParams } from './searchToQueryParams';
import { ISortingRules } from 'component/project/Project/ProjectFeatureToggles/PaginatedProjectFeatureToggles';

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

const fallbackData: {
    features: IFeatureToggleListItem[];
    total: number;
} = {
    features: [],
    total: 0,
};

const createFeatureSearch = () => {
    let total = 0;
    let initialLoad = true;

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
        const { data, error, mutate, isLoading } =
            useSWR<IFeatureSearchResponse>(KEY, fetcher, options);

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        if (data?.total) {
            total = data.total;
        }

        if (!isLoading && initialLoad) {
            initialLoad = false;
        }

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: isLoading,
            error,
            refetch,
            total,
            initialLoad: isLoading && initialLoad,
        };
    };
};

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
    const KEY = `api/admin/search/features?projectId=${projectId}&offset=${offset}&limit=${limit}&${searchQueryParams}&${sortQueryParams}`;
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
    const { sortBy, sortOrder, isFavoritesPinned } = sortingRules;
    const sortQueryParams = `sortBy=${sortBy}&sortOrder=${sortOrder}&favoritesFirst=${isFavoritesPinned}`;
    return sortQueryParams;
};
