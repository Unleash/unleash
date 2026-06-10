import { useMemo } from 'react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import type { FeatureSearchResponseSchema } from 'openapi';
import type {
    LifecycleStageName,
    ResolvedFeature,
} from '../views/FollowedFeaturesList/FollowedFeaturesList';

const toResolved = (
    feature: FeatureSearchResponseSchema,
    fallbackStage: LifecycleStageName | null,
): ResolvedFeature => ({
    name: feature.name,
    project: feature.project,
    type: feature.type,
    lifecycleStage: feature.lifecycle?.stage ?? fallbackStage,
});

// The feature search endpoint returns either active or archived features,
// never both, so followed features are resolved with one query per state.
export const useResolvedFeatures = (
    featureNames: string[],
): { features: ResolvedFeature[]; loading: boolean } => {
    const query = featureNames.join(',');
    const { features: activeFeatures, loading: activeLoading } =
        useFeatureSearch({
            query,
            limit: '100',
        });
    const { features: archivedFeatures, loading: archivedLoading } =
        useFeatureSearch({
            query,
            limit: '100',
            archived: 'IS:true',
        });

    const resolved = useMemo(() => {
        const followed = new Set(featureNames);
        const seen = new Set<string>();
        const merged: ResolvedFeature[] = [];

        const collect = (
            features: FeatureSearchResponseSchema[],
            fallbackStage: LifecycleStageName | null,
        ) => {
            for (const feature of features) {
                if (!followed.has(feature.name) || seen.has(feature.name)) {
                    continue;
                }
                seen.add(feature.name);
                merged.push(toResolved(feature, fallbackStage));
            }
        };

        collect(activeFeatures as FeatureSearchResponseSchema[], null);
        // Flags archived before lifecycle tracking have no lifecycle data;
        // they still belong in the archived group.
        collect(archivedFeatures as FeatureSearchResponseSchema[], 'archived');

        return merged;
    }, [activeFeatures, archivedFeatures, featureNames]);

    return {
        features: resolved,
        loading: activeLoading || archivedLoading,
    };
};
