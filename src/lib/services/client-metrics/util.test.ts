import { IClientMetricsEnv } from '../../types/stores/client-metrics-store-v2';
import { generateLastNHours, groupMetricsOnEnv, roundDownToHour } from './util';

test('should return list of 24 horus', () => {
    const hours = generateLastNHours(24, new Date(2021, 10, 10, 15, 30, 1, 0));

    expect(hours).toHaveLength(24);
    expect(hours[0]).toStrictEqual(new Date(2021, 10, 10, 15, 0, 0));
    expect(hours[1]).toStrictEqual(new Date(2021, 10, 10, 14, 0, 0));
    expect(hours[2]).toStrictEqual(new Date(2021, 10, 10, 13, 0, 0));
    expect(hours[23]).toStrictEqual(new Date(2021, 10, 9, 16, 0, 0));
});

test('should group metrics together', () => {
    const date = roundDownToHour(new Date());
    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 2,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 3,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'test',
            timestamp: date,
            yes: 1,
            no: 3,
        },
    ];

    const grouped = groupMetricsOnEnv(metrics);

    expect(grouped[0]).toStrictEqual({
        timestamp: date,
        environment: 'default',
        yes_count: 5,
        no_count: 4,
    });
    expect(grouped[1]).toStrictEqual({
        timestamp: date,
        environment: 'test',
        yes_count: 1,
        no_count: 3,
    });
});
