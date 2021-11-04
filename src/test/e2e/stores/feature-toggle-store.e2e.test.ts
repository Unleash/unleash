import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;
let featureToggleStore;

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('feature_toggle_store_serial', getLogger);
    stores = db.stores;
    featureToggleStore = stores.featureToggleStore;
});

afterAll(async () => {
    await db.destroy();
});

test('should not crash for unknown toggle', async () => {
    const project = await featureToggleStore.getProjectId(
        'missing-toggle-name',
    );
    expect(project).toBe(undefined);
});

test('should not crash for undefined toggle name', async () => {
    const project = await featureToggleStore.getProjectId(undefined);
    expect(project).toBe(undefined);
});
