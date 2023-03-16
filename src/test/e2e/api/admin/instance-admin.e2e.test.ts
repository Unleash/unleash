import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { IUnleashStores } from '../../../../lib/types';

let app;
let db;
let stores: IUnleashStores;

beforeAll(async () => {
    db = await dbInit('instance_admin_api_serial', getLogger);
    stores = db.stores;
    await stores.settingStore.insert('instanceInfo', { id: 'test-static' });
    app = await setupApp(stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return instance statistics', async () => {
    stores.featureToggleStore.create('default', { name: 'TestStats1' });

    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.featureToggles).toBe(1);
        });
});

test('should return instance statistics with correct number of projects', async () => {
    await stores.projectStore.create({
        id: 'test',
        name: 'Test',
        description: 'lorem',
        mode: 'open' as const,
    });

    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.projects).toBe(2);
        });
});

test('should return signed instance statistics', async () => {
    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.instanceId).toBe('test-static');
            expect(res.body.sum).toBe(
                '5ba2cb7c3e29f4e5b3382c560b92b837f3603dc7db73a501ec331c7f0ed17bd0',
            );
        });
});

test('should return instance statistics as CVS', async () => {
    stores.featureToggleStore.create('default', { name: 'TestStats2' });
    stores.featureToggleStore.create('default', { name: 'TestStats3' });

    const res = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

    expect(res.text).toMatch(/featureToggles/);
    expect(res.text).toMatch(/"sum"/);
});
