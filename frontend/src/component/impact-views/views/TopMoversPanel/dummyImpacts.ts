import type { FlagImpact } from '../computeFlagImpacts';

// TEMPORARY dev-only preview data for eyeballing the Top Movers panel —
// remove together with its `import.meta.env.DEV` wiring in ImpactViewsPage
// before shipping. Six rows so the `+N more` overflow shows; one long name
// to exercise the ellipsis; both tiny-flat and negative tones represented.
export const DUMMY_FLAG_IMPACTS: FlagImpact[] = [
    { featureName: 'checkout-redesign', deltaPct: 42, tone: 'up' },
    { featureName: 'new-pricing-banner', deltaPct: -18, tone: 'down' },
    {
        featureName: 'mobile-onboarding-flow-experiment-v2',
        deltaPct: 7.5,
        tone: 'up',
    },
    { featureName: 'search-ranking-v2', deltaPct: -3.2, tone: 'down' },
    { featureName: 'perf-lazy-images', deltaPct: 0.4, tone: 'flat' },
    { featureName: 'beta-dashboard', deltaPct: 0.2, tone: 'flat' },
];
