import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type {
    IClientMetricsStoreV2,
    IUnleashStores,
} from '../../../types/index.js';
import { endOfDay, setHours, startOfHour, subDays } from 'date-fns';

let stores: IUnleashStores;
let db: ITestDb;
let clientMetricsStore: IClientMetricsStoreV2;

beforeAll(async () => {
    db = await dbInit('client_metrics_aggregation', getLogger);
    stores = db.stores;
    clientMetricsStore = stores.clientMetricsStoreV2;
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await clientMetricsStore.clearMetrics(0);
    await clientMetricsStore.clearDailyMetrics(0);
});

test('aggregate daily metrics from previous day', async () => {
    const yesterday = subDays(new Date(), 1);
    await clientMetricsStore.batchInsertMetrics([
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: setHours(yesterday, 10),
            no: 0,
            yes: 1,
            variants: {
                a: 1,
                b: 0,
            },
        },
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: setHours(yesterday, 11),
            no: 1,
            yes: 1,
            variants: {
                a: 0,
                b: 1,
            },
        },
    ]);

    await clientMetricsStore.aggregateDailyMetrics();

    const hourlyMetrics = await clientMetricsStore.getMetricsForFeatureToggleV2(
        'feature',
        48,
    );
    expect(hourlyMetrics).toMatchObject([
        {
            featureName: 'feature',
            appName: 'test',
            environment: 'development',
            timestamp: startOfHour(setHours(yesterday, 10)),
            yes: 1,
            no: 0,
            variants: { a: 1, b: 0 },
        },
        {
            featureName: 'feature',
            appName: 'test',
            environment: 'development',
            timestamp: startOfHour(setHours(yesterday, 11)),
            yes: 1,
            no: 1,
            variants: { a: 0, b: 1 },
        },
    ]);
    const dailyMetrics = await clientMetricsStore.getMetricsForFeatureToggleV2(
        'feature',
        49,
    );
    expect(dailyMetrics).toMatchObject([
        {
            featureName: 'feature',
            appName: 'test',
            environment: 'development',
            timestamp: endOfDay(yesterday),
            yes: 2,
            no: 1,
            variants: { a: 1, b: 1 },
        },
    ]);
});

test('clear daily metrics', async () => {
    const yesterday = subDays(new Date(), 1);
    const twoDaysAgo = subDays(new Date(), 2);
    await clientMetricsStore.batchInsertMetrics([
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: yesterday,
            no: 0,
            yes: 1,
            variants: {
                a: 0,
                b: 1,
            },
        },
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: twoDaysAgo,
            no: 0,
            yes: 2,
            variants: {
                a: 1,
                b: 1,
            },
        },
    ]);
    await clientMetricsStore.aggregateDailyMetrics();

    await clientMetricsStore.clearDailyMetrics(2);

    const dailyMetrics = await clientMetricsStore.getMetricsForFeatureToggleV2(
        'feature',
        49,
    );
    expect(dailyMetrics).toMatchObject([
        {
            featureName: 'feature',
            appName: 'test',
            environment: 'development',
            timestamp: endOfDay(yesterday),
            yes: 1,
            no: 0,
            variants: { a: 0, b: 1 },
        },
    ]);
});

test('clear daily metrics', async () => {
    const yesterday = subDays(new Date(), 1);
    const twoDaysAgo = subDays(new Date(), 2);
    await clientMetricsStore.batchInsertMetrics([
        {
            appName: 'irrelevant',
            featureName: 'irrelevant',
            environment: 'irrelevant',
            timestamp: yesterday,
            no: 0,
            yes: 1,
            variants: {
                a: 0,
                b: 1,
            },
        },
        {
            appName: 'irrelevant',
            featureName: 'irrelevant',
            environment: 'irrelevant',
            timestamp: twoDaysAgo,
            no: 0,
            yes: 2,
            variants: {
                a: 1,
                b: 1,
            },
        },
    ]);
    await clientMetricsStore.aggregateDailyMetrics();

    await clientMetricsStore.clearDailyMetrics(2);

    const results = await db.rawDatabase
        .table('client_metrics_env_daily')
        .select('*');
    expect(results.length).toBe(1);
    const variantResults = await db.rawDatabase
        .table('client_metrics_env_variants_daily')
        .select('*');
    expect(variantResults.length).toBe(2);
});

test('count previous day metrics', async () => {
    const yesterday = subDays(new Date(), 1);
    await clientMetricsStore.batchInsertMetrics([
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: setHours(yesterday, 10),
            no: 0,
            yes: 1,
            variants: {
                a: 1,
                b: 0,
            },
        },
        {
            appName: 'test',
            featureName: 'feature',
            environment: 'development',
            timestamp: setHours(yesterday, 11),
            no: 1,
            yes: 1,
            variants: {
                a: 0,
                b: 1,
            },
        },
    ]);

    const result =
        await clientMetricsStore.countPreviousDayHourlyMetricsBuckets();

    expect(result).toMatchObject({ enabledCount: 2, variantCount: 4 });
});
