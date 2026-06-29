import { lazy } from 'react';

export const LazyImpactViewsPage = lazy(() =>
    import('./ImpactViewsPage.tsx').then((module) => ({
        default: module.ImpactViewsPage,
    })),
);
