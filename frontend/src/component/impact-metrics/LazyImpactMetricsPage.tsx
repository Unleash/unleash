import { lazy } from 'react';

export const LazyImpactMetricsPage = lazy(() =>
    import('./ImpactMetricsPage.tsx').then((module) => ({
        default: module.ImpactMetricsPage,
    })),
);
