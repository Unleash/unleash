import dbInit from '../../test/e2e/helpers/database-init';
import getLogger from '../../test/fixtures/no-logger';
import { IClientMetricsStoreV2 } from '../types';
import { setHours, startOfDay, subDays } from 'date-fns';

let stores;
let db;
let clientMetricsStore: IClientMetricsStoreV2;

beforeAll(async () => {
    db = await dbInit('client_metrics_aggregation', getLogger);
    stores = db.stores;
    clientMetricsStore = stores.clientMetricsStoreV2;
});

afterAll(async () => {
    await db.destroy();
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

    // TODO: change to store methods once we build them
    const results = await db.rawDatabase
        .table('client_metrics_env_daily')
        .select('*');
    expect(results).toMatchObject([
        {
            feature_name: 'feature',
            app_name: 'test',
            environment: 'development',
            yes: 2,
            no: 1,
            date: startOfDay(yesterday),
        },
    ]);
    const variantResults = await db.rawDatabase
        .table('client_metrics_env_variants_daily')
        .select('*');
    expect(variantResults).toMatchObject([
        {
            feature_name: 'feature',
            app_name: 'test',
            environment: 'development',
            date: startOfDay(yesterday),
            variant: 'a',
            count: 1,
        },
        {
            feature_name: 'feature',
            app_name: 'test',
            environment: 'development',
            date: startOfDay(yesterday),
            variant: 'b',
            count: 1,
        },
    ]);
});
