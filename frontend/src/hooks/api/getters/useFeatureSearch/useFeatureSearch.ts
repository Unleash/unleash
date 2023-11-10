import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
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
        const { data, error, mutate } = useSWR<IFeatureSearchResponse>(
            KEY,
            fetcher,
            options,
        );

        const refetch = useCallback(() => {
            mutate();
        }, [mutate]);

        if (data?.total) {
            total = data.total;
        }

        const returnData = data || fallbackData;
        return {
            ...returnData,
            loading: false,
            error,
            refetch,
            total,
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
