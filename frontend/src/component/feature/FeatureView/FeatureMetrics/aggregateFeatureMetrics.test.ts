import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { aggregateFeatureMetrics } from './aggregateFeatureMetrics.js';

describe('aggregateFeatureMetrics', () => {
    it('should aggregate yes and no values for identical timestamps', () => {
        const data: IFeatureMetricsRaw[] = [
            {
                featureName: 'Feature1',
                appName: 'App1',
                environment: 'dev',
                timestamp: '2024-01-12T08:00:00.000Z',
                yes: 10,
                no: 5,
                variants: { a: 1, b: 2 },
            },
            {
                featureName: 'Feature1',
                appName: 'App1',
                environment: 'dev',
                timestamp: '2024-01-12T08:00:00.000Z',
                yes: 15,
                no: 10,
                variants: { a: 2, b: 1 },
            },
        ];

        const result = aggregateFeatureMetrics(data);
        expect(result).toEqual([
            {
                featureName: 'Feature1',
                appName: 'App1',
                environment: 'dev',
                timestamp: '2024-01-12T08:00:00.000Z',
                yes: 25,
                no: 15,
                variants: { a: 3, b: 3 },
            },
        ]);
    });

    it('should handle undefined variants correctly', () => {
        const data: IFeatureMetricsRaw[] = [
            {
                featureName: 'Feature2',
                appName: 'App2',
                environment: 'test',
                timestamp: '2024-01-13T09:00:00.000Z',
                yes: 20,
                no: 10,
                variants: undefined,
            },
            {
                featureName: 'Feature2',
                appName: 'App2',
                environment: 'test',
                timestamp: '2024-01-13T09:00:00.000Z',
                yes: 30,
                no: 15,
                variants: undefined,
            },
        ];

        const result = aggregateFeatureMetrics(data);
        expect(result).toEqual([
            {
                featureName: 'Feature2',
                appName: 'App2',
                environment: 'test',
                timestamp: '2024-01-13T09:00:00.000Z',
                yes: 50,
                no: 25,
                variants: undefined,
            },
        ]);
    });
});
