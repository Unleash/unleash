import useSWRImmutable from 'swr/immutable';
import { useCallback, useMemo } from 'react';
import {
    type IUseFeatureOutput,
    type IFeatureResponse,
    featureFetcher,
    formatFeatureApiPath,
    useFeature,
    enrichConstraintsWithIds,
} from 'hooks/api/getters/useFeature/useFeature';

// useFeatureImmutable is like useFeature, except it won't refetch data on
// focus/reconnect/remount. Useful for <form>s that need a stable copy of
// the data. In particular, the lastSeenAt field may often change.
export const useFeatureImmutable = (
    projectId: string,
    featureId: string,
): IUseFeatureOutput => {
    const { refetchFeature } = useFeature(projectId, featureId);
    const path = formatFeatureApiPath(projectId, featureId);

    const { data, error, mutate } = useSWRImmutable<IFeatureResponse>(
        ['useFeatureImmutable', path],
        () => featureFetcher(path),
    );

    const refetch = useCallback(async () => {
        await mutate();
        await refetchFeature();
    }, [mutate, refetchFeature]);

    const feature = useMemo(enrichConstraintsWithIds(data), [data?.body]);

    return {
        feature,
        refetchFeature: refetch,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};
