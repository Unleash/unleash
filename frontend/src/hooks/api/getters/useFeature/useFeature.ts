import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { IFeatureToggle } from '../../../../interfaces/featureToggle';
import { emptyFeature } from './emptyFeature';
import handleErrorResponses from '../httpErrorResponseHandler';
import { formatApiPath } from '../../../../utils/format-path';

interface IUseFeatureOutput {
    feature: IFeatureToggle;
    featureCacheKey: string;
    refetchFeature: () => void;
    loading: boolean;
    error?: Error;
}

export const useFeature = (
    projectId: string,
    featureId: string,
    options?: SWRConfiguration
): IUseFeatureOutput => {
    const path = formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}`
    );

    const { data, error } = useSWR<IFeatureToggle>(
        path,
        () => fetcher(path),
        options
    );

    const refetchFeature = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        feature: data || emptyFeature,
        featureCacheKey: path,
        refetchFeature,
        loading: !error && !data,
        error,
    };
};

const fetcher = async (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Feature toggle data'))
        .then(res => res.json());
};
