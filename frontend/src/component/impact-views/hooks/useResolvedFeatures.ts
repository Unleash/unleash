import { useMemo } from 'react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import type { FeatureSearchResponseSchema } from 'openapi';
import type { ResolvedFeature } from '../views/FollowedFeaturesList/FollowedFeaturesList';

export const useResolvedFeatures = (
    featureNames: string[],
): { features: ResolvedFeature[]; loading: boolean } => {
    const { features, loading } = useFeatureSearch({
        query: featureNames.join(','),
        limit: '100',
    });

    const resolved = useMemo(() => {
        const followed = new Set(featureNames);
        return (features as FeatureSearchResponseSchema[])
            .filter((feature) => followed.has(feature.name))
            .map(
                (feature): ResolvedFeature => ({
                    name: feature.name,
                    project: feature.project,
                    type: feature.type,
                    lifecycleStage: feature.lifecycle?.stage ?? null,
                }),
            );
    }, [features, featureNames]);

    return { features: resolved, loading };
};
