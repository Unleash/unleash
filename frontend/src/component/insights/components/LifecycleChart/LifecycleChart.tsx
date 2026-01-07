import { lazy } from 'react';

export const LifecycleChart = lazy(
    () => import('./LifecycleChartComponent.tsx'),
);
