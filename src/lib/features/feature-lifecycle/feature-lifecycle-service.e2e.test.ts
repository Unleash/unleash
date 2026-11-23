import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { FEATURE_ARCHIVED } from '../../events/index.js';
import { sharedEventEmitter } from '../../util/index.js';
import { createFeatureLifecycleService } from './createFeatureLifecycle.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_lifecycle_service', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('archiving a flag that is hard-deleted meanwhile does not fail the listener', async () => {
    const { featureToggleStore } = db.stores;
    createFeatureLifecycleService(db.config)(db.rawDatabase).listen();
    const [whenFlagArchived] = sharedEventEmitter
        .listeners(FEATURE_ARCHIVED)
        .slice(-1);
    await featureToggleStore.create('default', {
        name: 'deleted-during-archive',
        createdByUserId: 9999,
    });
    await featureToggleStore.archive('deleted-during-archive');

    const [escapedFailure] = await Promise.all([
        whenFlagArchived({
            type: FEATURE_ARCHIVED,
            featureName: 'deleted-during-archive',
        }).catch((error: Error) => error),
        featureToggleStore.batchDelete(['deleted-during-archive']),
    ]);

    expect(escapedFailure).toBeUndefined();
});
