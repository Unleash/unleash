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

// Resolves followed flag names into the shape FollowedFeaturesList renders.
// One cross-project search (no project filter) whose `query` is the followed
// names — comma-split server-side into `name ILIKE ANY (...)`, so only our
// flags come back regardless of how many flags the instance has. The search is
// a substring match (`%name%`), so it can return extra flags (e.g. `foo-1` also
// matches `foo-10`); we keep only those whose name is actually followed.
// Followed names that don't resolve to a real flag are dropped.
export const useResolvedFeatures = (
    featureNames: string[],
): { features: ResolvedFeature[]; loading: boolean } => {
    const { features, loading } = useFeatureSearch({
        query: featureNames.join(','),
        limit: '100',
    });

    // Memoized so `resolved` keeps a stable identity across renders — the
    // FollowedFeaturesList groups by `features` in its own useMemo.
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
