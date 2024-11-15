import noLoggerProvider from '../../fixtures/no-logger';
import dbInit, { type ITestDb } from '../helpers/database-init';
import { createTestConfig } from '../../config/test-config';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../helpers/test-helper';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    const config = createTestConfig({
        getLogger: noLoggerProvider,
    });
    db = await dbInit('telemetry_migration', config.getLogger, {});
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should list active sessions', async () => {
    const instanceStatsService = app.services.instanceStatsService;

    const versionService = app.services.versionService;

    const newImpl = await instanceStatsService.getFeatureUsageInfo();
    const oldImpl = await versionService.getFeatureUsageInfo();
    console.log(newImpl);
    console.log(oldImpl);
    expect(newImpl).toStrictEqual(oldImpl);
});
