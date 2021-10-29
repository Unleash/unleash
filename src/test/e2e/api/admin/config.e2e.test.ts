import dbInit, { ITestDb } from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { simpleAuthKey } from '../../../../lib/types/settings/simple-auth-settings';

let db: ITestDb;
let app;

beforeAll(async () => {
    db = await dbInit('config_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('gets ui config', async () => {
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.unleashUrl).toBe('http://localhost:4242');
    expect(body.version).toBeDefined();
});

test('gets ui config with disablePasswordAuth', async () => {
    await db.stores.settingStore.insert(simpleAuthKey, { disabled: true });
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.disablePasswordAuth).toBe(true);
});
