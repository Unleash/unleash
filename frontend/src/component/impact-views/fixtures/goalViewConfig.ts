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
