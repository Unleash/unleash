import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { simpleAuthSettingsKey } from '../../../../lib/types/settings/simple-auth-settings';
import { randomId } from '../../../../lib/util/random-id';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('config_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await app.services.settingService.deleteAll();
});

test('gets ui config fields', async () => {
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.unleashUrl).toBe('http://localhost:4242');
    expect(body.version).toBeDefined();
    expect(body.emailEnabled).toBe(false);
});

test('gets ui config with disablePasswordAuth', async () => {
    await db.stores.settingStore.insert(simpleAuthSettingsKey, {
        disabled: true,
    });
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.disablePasswordAuth).toBe(true);
});

test('gets ui config with frontendSettings', async () => {
    const frontendApiOrigins = ['https://example.net'];
    await app.services.settingService.setFrontendSettings(
        { frontendApiOrigins },
        randomId(),
    );
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) =>
            expect(res.body.frontendApiOrigins).toEqual(frontendApiOrigins),
        );
});

test('sets ui config with frontendSettings', async () => {
    const frontendApiOrigins = ['https://example.org'];
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual(['*']));
    await app.request
        .post('/api/admin/ui-config')
        .send({ frontendSettings: { frontendApiOrigins: [] } })
        .expect(204);
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual([]));
    await app.request
        .post('/api/admin/ui-config')
        .send({ frontendSettings: { frontendApiOrigins } })
        .expect(204);
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) =>
            expect(res.body.frontendApiOrigins).toEqual(frontendApiOrigins),
        );
});
