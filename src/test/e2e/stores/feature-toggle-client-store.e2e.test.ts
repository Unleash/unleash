import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { IUnleashTest, setupApp } from '../helpers/test-helper';
import { IFeatureToggleClientStore, IUnleashStores } from '../../../lib/types';

let stores: IUnleashStores;
let app: IUnleashTest;
let db: ITestDb;
let clientFeatureToggleStore: IFeatureToggleClientStore;

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('feature_toggle_client_store_serial', getLogger);
    app = await setupApp(db.stores);
    stores = db.stores;
    clientFeatureToggleStore = stores.clientFeatureToggleStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should be able to fetch client toggles', async () => {
    const response = await app.request
        .post('/api/admin/state/import?drop=true')
        .attach('file', 'src/test/examples/exported-segments.json');

    expect(response.status).toBe(202);

    const clientToggles = await clientFeatureToggleStore.getClient({});
    expect(clientToggles).toHaveLength(1);
});
