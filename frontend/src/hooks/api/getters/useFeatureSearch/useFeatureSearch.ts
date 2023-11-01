import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import { useUiFlag } from '../../../useUiFlag';

type IFeatureSearchResponse = { features: IFeatureToggleListItem[] };

interface IUseFeatureSearchOutput {
    features: IFeatureSearchResponse;
    loading: boolean;
    error: string;
    refetch: () => void;
}

const fallbackFeatures: { features: IFeatureToggleListItem[]; total: number } =
    {
        features: [],
        total: 0,
    };

export const useFeatureSearch = (
    cursor: string,
    projectId = '',
    options: SWRConfiguration = {},
): IUseFeatureSearchOutput => {
    const featureSearchApi = useUiFlag('featureSearchAPI');
    const { KEY, fetcher } = getFeatureSearchFetcher(projectId, cursor);
    const { data, error, mutate } = useConditionalSWR<IFeatureSearchResponse>(
        featureSearchApi,
        fallbackFeatures,
        KEY,
        fetcher,
        options,
    );

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    return {
        features: data || fallbackFeatures,
        loading: !error && !data,
        error,
        refetch,
    };
};

const getFeatureSearchFetcher = (projectId: string, cursor: string) => {
    const KEY = `api/admin/search/features?projectId=${projectId}&cursor=${cursor}`;

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
