import type {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature.js';
import type { Segment } from 'unleash-client/lib/strategy/strategy.js';

export const enhanceFeaturesWithSegments = (
    toggles: FeatureInterface[] | undefined,
    segments: Segment[] | undefined,
): EnhancedFeatureInterface[] => {
    const lookup = new Map(
        (segments ?? []).map((segment) => [segment.id, segment]),
    );
    return (toggles ?? []).map((toggle) => {
        const { strategies, ...restOfToggle } = toggle;
        return {
            ...restOfToggle,
            strategies: strategies?.map((strategy) => {
                const { segments, ...restOfStrategy } = strategy;
                return {
                    ...restOfStrategy,
                    segments: segments?.map((segmentId) =>
                        lookup.get(segmentId),
                    ),
                };
            }),
        };
    });
};
