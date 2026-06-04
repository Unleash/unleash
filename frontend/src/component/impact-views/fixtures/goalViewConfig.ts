import type { MetricView } from '../views/types';

export const GOAL_VIEW: MetricView = {
    id: 'goal-view',
    title: 'Purchases',
    environment: 'production',
    timeRange: 'month',
    featureNames: ['impact-views-1', 'impact-views-2', 'impact-views-3'],
    createdAt: 0,
    updatedAt: 0,
    metrics: [
        {
            id: 'purchases',
            metricName: 'purchases',
            displayName: 'Purchases',
            title: 'Purchases',
            aggregationMode: 'count',
            labelSelectors: {},
            source: 'internal',
            yAxisMin: 'auto',
            timeRange: 'month',
            goal: true,
        },
        {
            id: 'error_rate',
            metricName: 'error_rate',
            displayName: 'Error rate',
            title: 'Error rate',
            aggregationMode: 'count',
            labelSelectors: {},
            source: 'internal',
            yAxisMin: 'auto',
            timeRange: 'month',
        },
    ],
};

// Temporary multi-view list for the switcher. All three share GOAL_VIEW's
// config (same data), differing only in id/title, until user-created views +
// localStorage land.
export const DUMMY_VIEWS: MetricView[] = [
    { ...GOAL_VIEW, id: 'view-purchases', title: 'Purchases' },
    { ...GOAL_VIEW, id: 'view-growth', title: 'Growth' },
    { ...GOAL_VIEW, id: 'view-checkout', title: 'Checkout' },
];
