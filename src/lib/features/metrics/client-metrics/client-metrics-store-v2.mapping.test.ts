import EventEmitter from 'node:events';
import { endOfDay } from 'date-fns';
import type { Db } from '../../../db/db.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import { ClientMetricsStoreV2 } from './client-metrics-store-v2.js';

type MetricRow = {
    feature_name: string;
    app_name: string;
    environment: string;
    timestamp?: Date;
    date?: Date;
    yes: string;
    no: string;
    variant: string | null;
    count: number | null;
};

// Supply joined rows directly so these tests exercise the store's result
// mapping independently of PostgreSQL and the SQL join itself.
const storeWithRows = (rows: MetricRow[]) => {
    const query = {
        select: () => query,
        leftJoin: () => query,
        where: () => query,
        andWhereRaw: async () => rows,
    };
    const db = (() => query) as unknown as Db;
    const config = createTestConfig();
    return new ClientMetricsStoreV2(
        db,
        new EventEmitter(),
        config.getLogger,
        config.flagResolver,
    );
};

const timestamp = new Date('2026-01-01T10:00:00Z');
const date = new Date('2026-01-01T00:00:00Z');

describe.each([
    {
        name: 'legacy hourly',
        period: { timestamp },
        expectedTimestamp: timestamp,
        read: (store: ClientMetricsStoreV2) =>
            store.getMetricsForFeatureToggle('demo'),
    },
    {
        name: 'extended hourly',
        period: { timestamp },
        expectedTimestamp: timestamp,
        read: (store: ClientMetricsStoreV2) =>
            store.getMetricsForFeatureToggleV2('demo', 48),
    },
    {
        name: 'extended daily',
        period: { date },
        expectedTimestamp: endOfDay(date),
        read: (store: ClientMetricsStoreV2) =>
            store.getMetricsForFeatureToggleV2('demo', 49),
    },
])('$name metrics result mapping', ({ period, expectedTimestamp, read }) => {
    const baseRow = {
        feature_name: 'demo',
        ...period,
        yes: '10',
        no: '2',
    };
    const firstApp = { app_name: 'web_api', environment: 'dev' };
    const secondApp = { app_name: 'web', environment: 'api_dev' };
    const expectedMetric = (app: typeof firstApp) => ({
        featureName: 'demo',
        appName: app.app_name,
        environment: app.environment,
        timestamp: expectedTimestamp,
        yes: 10,
        no: 2,
    });

    test('keeps underscore-containing app and environment names separate', async () => {
        const store = storeWithRows([
            { ...baseRow, ...firstApp, variant: 'blue', count: 4 },
            { ...baseRow, ...secondApp, variant: 'blue', count: 7 },
            { ...baseRow, ...firstApp, variant: 'red', count: 6 },
            { ...baseRow, ...secondApp, variant: 'red', count: 3 },
        ]);

        expect(await read(store)).toEqual([
            { ...expectedMetric(firstApp), variants: { blue: 4, red: 6 } },
            { ...expectedMetric(secondApp), variants: { blue: 7, red: 3 } },
        ]);
    });

    test('keeps metrics without variants separate', async () => {
        const store = storeWithRows([
            { ...baseRow, ...firstApp, variant: null, count: null },
            { ...baseRow, ...secondApp, variant: null, count: null },
        ]);

        expect(await read(store)).toEqual([
            { ...expectedMetric(firstApp), variants: {} },
            { ...expectedMetric(secondApp), variants: {} },
        ]);
    });

    test('still combines variant rows belonging to the same metric', async () => {
        const store = storeWithRows([
            { ...baseRow, ...firstApp, variant: 'blue', count: 0 },
            { ...baseRow, ...firstApp, variant: 'red', count: 10 },
        ]);

        expect(await read(store)).toEqual([
            { ...expectedMetric(firstApp), variants: { blue: 0, red: 10 } },
        ]);
    });

    test('returns no metrics for an empty result', async () => {
        expect(await read(storeWithRows([]))).toEqual([]);
    });
});
