import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { setupApp } from '../helpers/test-helper';

let stores;
let app;
let db;
let featureToggleClientStore;

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('feature_toggle_client_store_serial', getLogger);
    app = await setupApp(db.stores);
    stores = db.stores;
    featureToggleClientStore = stores.featureToggleClientStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeAll(async () => {
    const response = await app.request
        .post('/api/admin/state/import?drop=true')
        .attach('file', 'src/test/examples/exported-segments.json');

    expect(response.status).toBe(202);
});

test('should be able to fetch client toggles', async () => {
    const clientToggles = await featureToggleClientStore.getClient();
    expect(clientToggles).toHaveLength(1);
});

describe('strategy title queries', () => {
    test('should not add `title` by default', async () => {
        const clientToggles = await featureToggleClientStore.getClient();

        expect(clientToggles[0].strategies[0].title).toBeUndefined();
    });

    test('should add `title` to strategies when asked', async () => {
        const clientToggles = await featureToggleClientStore.getClient(
            undefined,
            ['strategy titles'],
        );

        expect(clientToggles[0].strategies[0].title).not.toBeUndefined();
    });
});
