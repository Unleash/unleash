import type { MetricView } from '../views/types';

// Hardcoded goal-view template pointing at real sandbox data. Replaced by
// user-created views once the editor + localStorage land. The metric names,
// project, and feature flags below must exist in the target instance to render
// real data (sandbox enterprise project `impact-views`).
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
