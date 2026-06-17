import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

// TEMPORARY dev-only preview data so the brush selection + panel show populated
// rows without real (unfollowed) flag flips in the sandbox. Remove together
// with its `import.meta.env.DEV` wiring in ImpactViewsPage before shipping.
//
// Spreads ~8 flips of flags the user does NOT follow across the visible window
// so any brushed sub-range lands on a few of them.
export const dummyWindowFlagEvents = (
    startMs: number,
    endMs: number,
    environment: string,
): MultimetricFeatureEvent[] => {
    const span = endMs - startMs;
    const at = (fraction: number) => Math.round(startMs + span * fraction);
    const flips: Array<{
        fraction: number;
        featureName: string;
        type: MultimetricFeatureEvent['type'];
    }> = [
        {
            fraction: 0.08,
            featureName: 'pricing-experiment',
            type: 'feature-environment-enabled',
        },
        {
            fraction: 0.17,
            featureName: 'new-search-ranking',
            type: 'feature-environment-enabled',
        },
        {
            fraction: 0.31,
            featureName: 'legacy-checkout',
            type: 'feature-environment-disabled',
        },
        {
            fraction: 0.44,
            featureName: 'recommendations-v3',
            type: 'feature-environment-enabled',
        },
        {
            fraction: 0.52,
            featureName: 'aggressive-caching',
            type: 'feature-environment-enabled',
        },
        {
            fraction: 0.68,
            featureName: 'email-digest',
            type: 'feature-environment-disabled',
        },
        {
            fraction: 0.79,
            featureName: 'beta-onboarding',
            type: 'feature-environment-enabled',
        },
        {
            fraction: 0.91,
            featureName: 'rate-limiter',
            type: 'feature-environment-enabled',
        },
    ];
    return flips.map((flip, index) => ({
        id: 900_000 + index,
        timestamp: at(flip.fraction),
        type: flip.type,
        label:
            flip.type === 'feature-environment-enabled'
                ? 'Enabled'
                : 'Disabled',
        createdBy: 'system@example.com',
        featureName: flip.featureName,
        environment,
    }));
};
