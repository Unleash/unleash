import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

type IFeatureSearchResponse = {
    features: IFeatureToggleListItem[];
    nextCursor: string;
    total: number;
};

interface IUseFeatureSearchOutput {
    features: IFeatureToggleListItem[];
    total: number;
    nextCursor: string;
    loading: boolean;
    error: string;
    refetch: () => void;
}

const fallbackData: {
    features: IFeatureToggleListItem[];
    total: number;
    nextCursor: string;
} = {
    features: [],
    total: 0,
    nextCursor: '',
};

export const useFeatureSearch = (
    cursor: string,
    projectId = '',
    options: SWRConfiguration = {},
): IUseFeatureSearchOutput => {
    const { KEY, fetcher } = getFeatureSearchFetcher(projectId, cursor);
    const { data, error, mutate } = useSWR<IFeatureSearchResponse>(
        KEY,
        fetcher,
        options,
    );

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    const returnData = data || fallbackData;
    return {
        ...returnData,
        loading: !error && !data,
        error,
        refetch,
    };
};

// temporary experiment
const getQueryParam = (queryParam: string, path: string | null) => {
    const url = new URL(path || '', 'https://getunleash.io');
    const params = new URLSearchParams(url.search);
    return params.get(queryParam) || '';
};

const getFeatureSearchFetcher = (projectId: string, cursor: string) => {
    const KEY = `api/admin/search/features?projectId=${projectId}&cursor=${cursor}&limit=25`;

    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Feature search'))
            .then(async (res) => {
                const json = await res.json();
                // TODO: try using Link as key
                const nextCursor = getQueryParam(
                    'cursor',
                    res.headers.get('link'),
                );
                return { ...json, nextCursor };
            });
    };

    return {
        fetcher,
        KEY,
    };
};
