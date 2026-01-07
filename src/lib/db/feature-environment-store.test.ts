import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';
import getLogger from '../../test/fixtures/no-logger.js';
import { SYSTEM_USER_ID } from '../server-impl.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_environment_store', getLogger, { isOss: true });
    getLogger.setMuteError(true);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    getLogger.setMuteError(false);
});

test('getAllByFeatures returns correct enabled state', async () => {
    await db.stores.featureToggleStore.create('default', {
        name: 'test-toggle',
        createdByUserId: SYSTEM_USER_ID,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        'test-toggle',
        'development',
        false,
    );
    const featureEnvs =
        await db.stores.featureEnvironmentStore.getAllByFeatures(
            ['test-toggle'],
            'development',
        );
    expect(featureEnvs[0].enabled).toBe(false);
});
