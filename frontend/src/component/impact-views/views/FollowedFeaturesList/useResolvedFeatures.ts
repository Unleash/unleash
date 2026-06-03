import { useMemo } from 'react';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import type { FeatureSearchResponseSchema } from 'openapi';
import type {
    LifecycleStageName,
    ResolvedFeature,
} from './FollowedFeaturesList';

const KNOWN_STAGES: ReadonlySet<string> = new Set<LifecycleStageName>([
    'initial',
    'pre-live',
    'live',
    'completed',
    'archived',
]);

const toLifecycleStage = (stage?: string | null): LifecycleStageName | null =>
    stage && KNOWN_STAGES.has(stage) ? (stage as LifecycleStageName) : null;

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
                    lifecycleStage: toLifecycleStage(feature.lifecycle?.stage),
                }),
            );
    }, [features, featureNames]);

    return { features: resolved, loading };
};
