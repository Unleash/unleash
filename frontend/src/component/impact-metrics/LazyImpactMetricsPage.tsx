import { lazy } from 'react';

export const LazyImpactMetricsPage = lazy(
    () => import('./LazyImpactMetricsPageExport.tsx'),
);
