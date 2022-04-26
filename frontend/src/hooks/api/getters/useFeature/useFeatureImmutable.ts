import useSWRImmutable from 'swr/immutable';
import { useCallback } from 'react';
import { emptyFeature } from './emptyFeature';
import {
    IUseFeatureOutput,
    IFeatureResponse,
    featureFetcher,
    formatFeatureApiPath,
} from 'hooks/api/getters/useFeature/useFeature';

// useFeatureImmutable is like useFeature, except it won't refetch data on
// focus/reconnect/remount. Useful for <form>s that need a stable copy of
// the data. In particular, the lastSeenAt field may often change.
export const useFeatureImmutable = (
    projectId: string,
    featureId: string
): IUseFeatureOutput => {
    const path = formatFeatureApiPath(projectId, featureId);

    const { data, error, mutate } = useSWRImmutable<IFeatureResponse>(
        ['useFeatureImmutable', path],
        () => featureFetcher(path)
    );

    const refetchFeature = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        feature: data?.body || emptyFeature,
        refetchFeature,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};
