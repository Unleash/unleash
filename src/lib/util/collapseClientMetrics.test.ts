import { collapseClientMetrics } from './collapseClientMetrics';
import { IClientMetricsEnv } from '../types/stores/client-metrics-store-v2';

test('collapseClientMetrics', () => {
    const timestamp = new Date();

    const metricAX1: IClientMetricsEnv = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp,
        yes: 1,
        no: 11,
    };

    const metricAX2: IClientMetricsEnv = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp,
        yes: 2,
        no: 12,
    };

    const metricBX: IClientMetricsEnv = {
        featureName: 'b',
        appName: 'x',
        environment: 'x',
        timestamp,
        yes: 101,
        no: 1001,
    };

    const metricBY: IClientMetricsEnv = {
        featureName: 'b',
        appName: 'y',
        environment: 'y',
        timestamp,
        yes: 102,
        no: 1002,
    };

    expect(
        collapseClientMetrics([metricAX1, metricAX2, metricBX, metricBY]),
    ).toEqual([
        {
            featureName: 'a',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 3,
            no: 23,
        },
        {
            featureName: 'b',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 101,
            no: 1001,
        },
        {
            featureName: 'b',
            appName: 'y',
            environment: 'y',
            timestamp,
            yes: 102,
            no: 1002,
        },
    ]);

    expect(
        collapseClientMetrics([
            metricAX1,
            metricAX1,
            metricAX2,
            metricAX2,
            metricBX,
            metricBX,
            metricBY,
            metricBY,
        ]),
    ).toEqual([
        {
            featureName: 'a',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 6,
            no: 46,
        },
        {
            featureName: 'b',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 202,
            no: 2002,
        },
        {
            featureName: 'b',
            appName: 'y',
            environment: 'y',
            timestamp,
            yes: 204,
            no: 2004,
        },
    ]);
});
